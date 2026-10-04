import express from "express";
import cors from "cors";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "./middleware/auth";
import { createCoreRouter } from "./routes/coreRoutes";
import { createOperationsRouter } from "./routes/operationsRoutes";
import { createAdminRouter } from "./routes/adminRoutes";
import { startSignOnScheduler } from "./services/signOnScheduler";

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

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

app.use(createCoreRouter(pool));
app.use(createOperationsRouter(pool));
app.use(createAdminRouter(pool));

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);

	startSignOnScheduler(pool);
});
