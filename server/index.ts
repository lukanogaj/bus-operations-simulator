import express from "express";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { generateWeeklySnapshot } from "./services/rotaService";

const app = express();
const port = 3000;

const JWT_SECRET = "bus-operations-secret";

app.use(express.json());
app.use(cors());

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

type AuthenticatedUser = {
	userId: number;
	username: string;
	role: "manager" | "controller";
};

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
		const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

		req.user = decoded;

		next();
	} catch (error) {
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

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
