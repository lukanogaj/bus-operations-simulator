import express from "express";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { generateWeeklySnapshot } from "./services/rotaService";
import {
	createReplacementAssignment,
	generateOperationalIssues,
} from "./services/operationsService";
import {
	createIncident,
	getIncidents,
	resolveIncident,
} from "./services/incidentService";
import {
	generateSignOnSheet,
	getSignOnSheet,
	signOnDriver,
	markDriverAbsent,
} from "./services/signOnService";
import { startSignOnScheduler } from "./services/signOnScheduler";
import {
	createUser,
	deleteUser,
	getUsers,
	updateUserPassword,
	updateUserRole,
} from "./services/adminService";
import { getOperationalReport } from "./services/reportService";
import { recommendReplacement } from "./services/aiAssistantService";
import {
	createPlannedAbsence,
	deletePlannedAbsence,
	getPlannedAbsences,
} from "./services/plannedAbsenceService";

const app = express();
const port = 3000;

const JWT_SECRET = "bus-operations-secret";

type UserRole = "manager" | "garage_supervisor";

type AuthenticatedUser = {
	userId: number;
	username: string;
	role: UserRole;
};

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

app.use(express.json());
app.use(cors());

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

const authenticateUser = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) => {
	const authorization = req.headers.authorization;

	if (!authorization) {
		return res.status(401).json({
			error: "Authentication required",
		});
	}

	const token = authorization.startsWith("Bearer ")
		? authorization.slice(7)
		: null;

	if (!token) {
		return res.status(401).json({
			error: "Invalid authorization header",
		});
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (
			typeof decoded !== "object" ||
			decoded === null ||
			typeof decoded.userId !== "number" ||
			typeof decoded.username !== "string" ||
			(decoded.role !== "manager" && decoded.role !== "garage_supervisor")
		) {
			return res.status(401).json({
				error: "Invalid token payload",
			});
		}

		req.user = {
			userId: decoded.userId,
			username: decoded.username,
			role: decoded.role,
		};

		next();
	} catch {
		return res.status(401).json({
			error: "Invalid or expired token",
		});
	}
};

const requireRole = (...allowedRoles: UserRole[]) => {
	return (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		if (!req.user) {
			return res.status(401).json({
				error: "Authentication required",
			});
		}

		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({
				error: "Insufficient permissions",
			});
		}

		next();
	};
};

app.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({
				error: "Username and password are required",
			});
		}

		const result = await pool.query(
			`SELECT id, username, password_hash, role
			 FROM users
			 WHERE username = $1`,
			[username],
		);

		const user = result.rows[0];

		if (!user) {
			return res.status(401).json({
				error: "Invalid username or password",
			});
		}

		const passwordMatches = await bcrypt.compare(password, user.password_hash);

		if (!passwordMatches) {
			return res.status(401).json({
				error: "Invalid username or password",
			});
		}

		const token = jwt.sign(
			{
				userId: user.id,
				username: user.username,
				role: user.role,
			},
			JWT_SECRET,
			{
				expiresIn: "90d",
			},
		);

		res.json({
			token,
			user: {
				id: user.id,
				username: user.username,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Login error:", error);

		res.status(500).json({
			error: "Login failed",
		});
	}
});

app.get("/drivers", authenticateUser, async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM drivers ORDER BY employee_number",
		);

		const drivers = result.rows.map((row) => ({
			employeeNumber: row.employee_number,
			batchNumber: row.batch_number,
			firstName: row.first_name,
			lastName: row.last_name,
			status: row.status,
			rota: row.rota,
			rotaWeek: row.rota_week,
			route: row.route,
		}));

		res.json(drivers);
	} catch (error) {
		console.error("Error fetching drivers:", error);

		res.status(500).json({
			error: "Failed to fetch drivers",
		});
	}
});

app.get("/duties", authenticateUser, async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM duties ORDER BY duty_number",
		);

		const duties = result.rows.map((row) => ({
			dutyNumber: row.duty_number,
			route: row.route,
			rota: row.rota,
			signOn: row.sign_on,
			signOff: row.sign_off,
		}));

		res.json(duties);
	} catch (error) {
		console.error("Error fetching duties:", error);

		res.status(500).json({
			error: "Failed to fetch duties",
		});
	}
});

app.get("/routes", authenticateUser, async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM routes ORDER BY route_number",
		);

		const routes = result.rows.map((row) => ({
			routeNumber: row.route_number,
		}));

		res.json(routes);
	} catch (error) {
		console.error("Error fetching routes:", error);

		res.status(500).json({
			error: "Failed to fetch routes",
		});
	}
});

app.get("/weekly-snapshot", authenticateUser, async (req, res) => {
	try {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date();

		const snapshot = await generateWeeklySnapshot(pool, startDate, currentDate);

		res.json(snapshot);
	} catch (error) {
		console.error("Error generating weekly snapshot:", error);

		res.status(500).json({
			error: "Failed to generate weekly snapshot",
		});
	}
});
app.get("/operations/issues", authenticateUser, async (req, res) => {
	try {
		const { date } = req.query;

		if (date !== undefined && typeof date !== "string") {
			return res.status(400).json({
				error: "Invalid operational date",
			});
		}

		if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			return res.status(400).json({
				error: "Operational date must use YYYY-MM-DD format",
			});
		}

		const issues = await generateOperationalIssues(pool, date);

		res.json(issues);
	} catch (error) {
		console.error("Error generating operational issues:", error);

		res.status(500).json({
			error: "Failed to generate operational issues",
		});
	}
});

app.post(
	"/operations/ai-recommendation",
	authenticateUser,
	async (req, res) => {
		try {
			const { employeeNumber, dutyNumber, assignmentDate } = req.body;

			if (!employeeNumber || !dutyNumber || !assignmentDate) {
				return res.status(400).json({
					error:
						"Employee number, duty number and assignment date are required",
				});
			}

			const issues = await generateOperationalIssues(pool);

			const issue = issues.find(
				(item) =>
					item.employeeNumber === Number(employeeNumber) &&
					item.dutyNumber === Number(dutyNumber) &&
					item.assignmentDate === assignmentDate,
			);

			if (!issue) {
				return res.status(404).json({
					error: "Operational issue not found",
				});
			}

			if (issue.coverageStatus === "COVERED") {
				return res.status(409).json({
					error: "This issue is already covered",
				});
			}

			if (issue.replacementCandidates.length === 0) {
				return res.status(409).json({
					error: "No valid replacement candidates available",
				});
			}

			const recommendation = await recommendReplacement(
				issue.replacementCandidates,
			);

			res.json({
				recommendation,
			});
		} catch (error) {
			console.error("Error generating AI recommendation:", error);

			const message =
				error instanceof Error
					? error.message
					: "Failed to generate AI recommendation";

			res.status(500).json({
				error: message,
			});
		}
	},
);

app.post("/operations/assignments", authenticateUser, async (req, res) => {
	try {
		const {
			absentDriverNumber,
			replacementDriverNumber,
			dutyNumber,
			assignmentDate,
		} = req.body;

		if (
			!absentDriverNumber ||
			!replacementDriverNumber ||
			!dutyNumber ||
			!assignmentDate
		) {
			return res.status(400).json({
				error: "All assignment fields are required",
			});
		}

		const assignment = await createReplacementAssignment(pool, {
			absentDriverNumber,
			replacementDriverNumber,
			dutyNumber,
			assignmentDate,
		});

		res.status(201).json(assignment);
	} catch (error) {
		console.error("Error creating replacement assignment:", error);

		const message =
			error instanceof Error
				? error.message
				: "Failed to create replacement assignment";

		res.status(400).json({
			error: message,
		});
	}
});

app.get("/incidents", authenticateUser, async (req, res) => {
	try {
		const incidents = await getIncidents(pool);

		res.json(incidents);
	} catch (error) {
		console.error("Error fetching incidents:", error);

		res.status(500).json({
			error: "Failed to fetch incidents",
		});
	}
});

app.post("/incidents", authenticateUser, async (req, res) => {
	try {
		const { incidentType, description, route, driverNumber } = req.body;

		if (!incidentType || !description) {
			return res.status(400).json({
				error: "Incident type and description are required",
			});
		}

		const incident = await createIncident(pool, {
			incidentType,
			description,
			route,
			driverNumber,
		});

		res.status(201).json(incident);
	} catch (error) {
		console.error("Error creating incident:", error);

		if (
			error instanceof Error &&
			(error.message === "Driver number does not exist" ||
				error.message === "Route does not exist")
		) {
			return res.status(400).json({
				error: error.message,
			});
		}

		res.status(500).json({
			error: "Failed to create incident",
		});
	}
});

app.patch("/incidents/:id/resolve", authenticateUser, async (req, res) => {
	try {
		const incidentId = Number(req.params.id);

		if (!Number.isInteger(incidentId)) {
			return res.status(400).json({
				error: "Invalid incident ID",
			});
		}

		const incident = await resolveIncident(pool, incidentId);

		res.json(incident);
	} catch (error) {
		console.error("Error resolving incident:", error);

		const message =
			error instanceof Error ? error.message : "Failed to resolve incident";

		const status = message === "Incident not found" ? 404 : 500;

		res.status(status).json({
			error: message,
		});
	}
});

app.get(
	"/sign-on/:date",
	authenticateUser,
	async (req: express.Request<{ date: string }>, res: express.Response) => {
		try {
			const { date } = req.params;
			const datePattern = /^\d{4}-\d{2}-\d{2}$/;

			if (!datePattern.test(date)) {
				return res.status(400).json({
					error: "Operational date must use YYYY-MM-DD format",
				});
			}

			const sheet = await getSignOnSheet(pool, date);

			res.json(sheet);
		} catch (error) {
			console.error("Error fetching sign-on sheet:", error);

			res.status(500).json({
				error: "Failed to fetch sign-on sheet",
			});
		}
	},
);

app.post("/sign-on/generate", authenticateUser, async (req, res) => {
	try {
		const { operationalDate } = req.body;

		if (!operationalDate) {
			return res.status(400).json({
				error: "Operational date is required",
			});
		}

		const datePattern = /^\d{4}-\d{2}-\d{2}$/;

		if (!datePattern.test(operationalDate)) {
			return res.status(400).json({
				error: "Operational date must use YYYY-MM-DD format",
			});
		}

		const date = new Date(`${operationalDate}T12:00:00`);

		if (Number.isNaN(date.getTime())) {
			return res.status(400).json({
				error: "Invalid operational date",
			});
		}

		const sheet = await generateSignOnSheet(pool, date);

		res.status(201).json(sheet);
	} catch (error) {
		console.error("Error generating sign-on sheet:", error);

		res.status(500).json({
			error: "Failed to generate sign-on sheet",
		});
	}
});

app.patch(
	"/sign-on/:id/sign-on",
	authenticateUser,
	async (req: express.Request<{ id: string }>, res: express.Response) => {
		try {
			const entryId = Number(req.params.id);

			if (!Number.isInteger(entryId) || entryId <= 0) {
				return res.status(400).json({
					error: "Invalid sign-on entry ID",
				});
			}

			const entry = await signOnDriver(pool, entryId);

			res.json(entry);
		} catch (error) {
			console.error("Error signing on driver:", error);

			const message =
				error instanceof Error ? error.message : "Failed to sign on driver";

			const status =
				message === "Sign-on entry not found"
					? 404
					: message === "Too late to sign on — contact the Counter" ||
						  message === "Driver is already signed on" ||
						  message === "Driver is marked absent — contact the Counter"
						? 409
						: 500;

			res.status(status).json({
				error: message,
			});
		}
	},
);

app.patch(
	"/sign-on/:id/absent",
	authenticateUser,
	async (req: express.Request<{ id: string }>, res: express.Response) => {
		try {
			const entryId = Number(req.params.id);

			if (!Number.isInteger(entryId) || entryId <= 0) {
				return res.status(400).json({
					error: "Invalid sign-on entry ID",
				});
			}

			const entry = await markDriverAbsent(pool, entryId);

			res.json(entry);
		} catch (error) {
			console.error("Error marking driver absent:", error);

			const message =
				error instanceof Error ? error.message : "Failed to mark driver absent";

			const status =
				message === "Sign-on entry not found"
					? 404
					: message === "Only a late driver can be marked absent"
						? 409
						: 500;

			res.status(status).json({
				error: message,
			});
		}
	},
);

app.get("/planned-absences", authenticateUser, async (req, res) => {
	try {
		const absences = await getPlannedAbsences(pool);

		res.json(absences);
	} catch (error) {
		console.error("Error fetching planned absences:", error);

		res.status(500).json({
			error: "Failed to fetch planned absences",
		});
	}
});
app.post("/planned-absences", authenticateUser, async (req, res) => {
	try {
		const { driverNumber, absenceType, startDate, endDate, notes } = req.body;

		if (!driverNumber || !absenceType || !startDate || !endDate) {
			return res.status(400).json({
				error:
					"Driver number, absence type, start date and end date are required",
			});
		}

		const absence = await createPlannedAbsence(pool, {
			driverNumber: Number(driverNumber),
			absenceType,
			startDate,
			endDate,
			notes,
		});

		res.status(201).json(absence);
	} catch (error) {
		console.error("Error creating planned absence:", error);

		const message =
			error instanceof Error
				? error.message
				: "Failed to create planned absence";

		res.status(400).json({
			error: message,
		});
	}
});
app.delete("/planned-absences/:id", authenticateUser, async (req, res) => {
	try {
		const absenceId = Number(req.params.id);

		if (!Number.isInteger(absenceId) || absenceId <= 0) {
			return res.status(400).json({
				error: "Invalid planned absence ID",
			});
		}

		await deletePlannedAbsence(pool, absenceId);

		res.status(204).send();
	} catch (error) {
		console.error("Error deleting planned absence:", error);

		const message =
			error instanceof Error
				? error.message
				: "Failed to delete planned absence";

		const status = message === "Planned absence not found" ? 404 : 500;

		res.status(status).json({
			error: message,
		});
	}
});
/* -------------------------------------------------------------------------- */
/* Reports API                                                                */
/* -------------------------------------------------------------------------- */

app.get("/reports", authenticateUser, async (req, res) => {
	try {
		const { from, to } = req.query;

		if (typeof from !== "string" || typeof to !== "string") {
			return res.status(400).json({
				error: "From and to dates are required",
			});
		}

		const datePattern = /^\d{4}-\d{2}-\d{2}$/;

		if (!datePattern.test(from) || !datePattern.test(to)) {
			return res.status(400).json({
				error: "Dates must use YYYY-MM-DD format",
			});
		}

		const fromDate = new Date(`${from}T12:00:00`);
		const toDate = new Date(`${to}T12:00:00`);

		if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
			return res.status(400).json({
				error: "Invalid report date range",
			});
		}

		if (fromDate > toDate) {
			return res.status(400).json({
				error: "From date cannot be after to date",
			});
		}

		const report = await getOperationalReport(pool, from, to);

		res.json(report);
	} catch (error) {
		console.error("Error generating operational report:", error);

		res.status(500).json({
			error: "Failed to generate operational report",
		});
	}
});

/* -------------------------------------------------------------------------- */
/* Admin API                                                                  */
/* -------------------------------------------------------------------------- */

app.get(
	"/admin/users",
	authenticateUser,
	requireRole("manager"),
	async (req, res) => {
		try {
			const users = await getUsers(pool);

			res.json(users);
		} catch (error) {
			console.error("Error fetching admin users:", error);

			res.status(500).json({
				error: "Failed to fetch users",
			});
		}
	},
);

app.post(
	"/admin/users",
	authenticateUser,
	requireRole("manager"),
	async (req, res) => {
		try {
			const { username, password, role } = req.body;

			if (!username || !password || !role) {
				return res.status(400).json({
					error: "Username, password and role are required",
				});
			}

			if (role !== "manager" && role !== "garage_supervisor") {
				return res.status(400).json({
					error: "Invalid user role",
				});
			}

			const user = await createUser(pool, {
				username,
				password,
				role,
			});

			res.status(201).json(user);
		} catch (error) {
			console.error("Error creating admin user:", error);

			const message =
				error instanceof Error ? error.message : "Failed to create user";

			const status = message === "Username already exists" ? 409 : 500;

			res.status(status).json({
				error: message,
			});
		}
	},
);

app.patch(
	"/admin/users/:id/role",
	authenticateUser,
	requireRole("manager"),
	async (req, res) => {
		try {
			const userId = Number(req.params.id);
			const { role } = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				return res.status(400).json({
					error: "Invalid user ID",
				});
			}

			if (role !== "manager" && role !== "garage_supervisor") {
				return res.status(400).json({
					error: "Invalid user role",
				});
			}

			const user = await updateUserRole(pool, userId, role);

			res.json(user);
		} catch (error) {
			console.error("Error updating user role:", error);

			const message =
				error instanceof Error ? error.message : "Failed to update user role";

			const status = message === "User not found" ? 404 : 500;

			res.status(status).json({
				error: message,
			});
		}
	},
);

app.patch(
	"/admin/users/:id/password",
	authenticateUser,
	requireRole("manager"),
	async (req, res) => {
		try {
			const userId = Number(req.params.id);
			const { password } = req.body;

			if (!Number.isInteger(userId) || userId <= 0) {
				return res.status(400).json({
					error: "Invalid user ID",
				});
			}

			if (!password) {
				return res.status(400).json({
					error: "Password is required",
				});
			}

			await updateUserPassword(pool, userId, password);

			res.json({
				message: "Password updated successfully",
			});
		} catch (error) {
			console.error("Error updating user password:", error);

			const message =
				error instanceof Error
					? error.message
					: "Failed to update user password";

			const status = message === "User not found" ? 404 : 500;

			res.status(status).json({
				error: message,
			});
		}
	},
);

app.delete(
	"/admin/users/:id",
	authenticateUser,
	requireRole("manager"),
	async (req, res) => {
		try {
			const userId = Number(req.params.id);

			if (!Number.isInteger(userId) || userId <= 0) {
				return res.status(400).json({
					error: "Invalid user ID",
				});
			}

			if (req.user?.userId === userId) {
				return res.status(400).json({
					error: "You cannot delete your own account",
				});
			}

			await deleteUser(pool, userId);

			res.status(204).send();
		} catch (error) {
			console.error("Error deleting admin user:", error);

			const message =
				error instanceof Error ? error.message : "Failed to delete user";

			const status = message === "User not found" ? 404 : 500;

			res.status(status).json({
				error: message,
			});
		}
	},
);

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);

	startSignOnScheduler(pool);
});
