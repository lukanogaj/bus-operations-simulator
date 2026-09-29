import express from "express";
import cors from "cors";
import { Pool } from "pg";
import { generateWeeklySnapshot } from "./services/rotaService";

const app = express();
app.use(cors());
const port = 3000;

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

app.get("/drivers", async (req, res) => {
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
		res.status(500).json({ error: "Failed to fetch drivers" });
	}
});

app.get("/duties", async (req, res) => {
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
		res.status(500).json({ error: "Failed to fetch duties" });
	}
});

app.get("/routes", async (req, res) => {
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
		res.status(500).json({ error: "Failed to fetch routes" });
	}
});

app.get("/weekly-snapshot", async (req, res) => {
	try {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date();

		const snapshot = await generateWeeklySnapshot(pool, startDate, currentDate);

		res.json(snapshot);
	} catch (error) {
		console.error("Error generating weekly snapshot:", error);
		res.status(500).json({ error: "Failed to generate weekly snapshot" });
	}
});
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
