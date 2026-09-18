import express from "express";
import { Pool } from "pg";

const app = express();
const port = 3000;

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

app.get("/drivers", async (req, res) => {
	try {
		const result = await pool.query(
			"SELECT * FROM drivers ORDER BY employee_number",
		);
		res.json(result.rows);
	} catch (error) {
		console.error("Error fetching drivers:", error);
		res.status(500).json({ error: "Failed to fetch drivers" });
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
