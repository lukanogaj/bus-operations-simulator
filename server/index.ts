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
import { generateSignOnSheet, getSignOnSheet } from "./services/signOnService";

const app = express();
const port = 3000;

const JWT_SECRET = "bus-operations-secret";

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
		jwt.verify(token, JWT_SECRET);

		next();
	} catch {
		return res.status(401).json({
			error: "Invalid or expired token",
		});
	}
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
		const issues = await generateOperationalIssues(pool);

		res.json(issues);
	} catch (error) {
		console.error("Error generating operational issues:", error);

		res.status(500).json({
			error: "Failed to generate operational issues",
		});
	}
});

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

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
