import { Pool } from "pg";
import { driverList } from "../data/drivers.js";

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

const migrate = async () => {
	for (const driver of driverList) {
		await pool.query(
			`INSERT INTO drivers (employee_number, batch_number, first_name, last_name, status, rota, rota_week, route)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (employee_number) DO NOTHING`,
			[
				driver.employeeNumber,
				driver.batchNumber,
				driver.firstName,
				driver.lastName,
				driver.status,
				driver.rota,
				driver.rotaWeek,
				driver.route,
			],
		);
	}

	console.log(`Migrated ${driverList.length} drivers.`);
	await pool.end();
};

migrate().catch((error) => {
	console.error("Migration failed:", error);
	process.exit(1);
});
