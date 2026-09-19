import express from "express";
import cors from "cors";
import { Pool } from "pg";

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
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
