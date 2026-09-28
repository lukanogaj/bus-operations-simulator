import type { Pool } from "pg";

export const generateWeeklySnapshot = async (
	pool: Pool,
	startDate: Date,
	currentDate: Date,
) => {
	const routesResult = await pool.query(
		"SELECT route_number FROM routes ORDER BY route_number",
	);

	const routes = routesResult.rows.map((row) => row.route_number);

	const driversResult = await pool.query(
		"SELECT * FROM drivers ORDER BY employee_number",
	);

	const drivers = driversResult.rows;
};
