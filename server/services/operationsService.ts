import type { Pool } from "pg";

type DriverStatus =
	| "available"
	| "sick"
	| "holiday"
	| "training"
	| "leaveNotice"
	| "suspended";

type Driver = {
	employee_number: number;
	batch_number: number;
	first_name: string;
	last_name: string;
	status: DriverStatus;
	rota: string;
	rota_week: number;
	route: string;
};

type ReplacementCandidate = {
	employeeNumber: number;
	batchNumber: number;
	firstName: string;
	lastName: string;
	rotaWeek: number;
};

type OperationalIssue = {
	employeeNumber: number;
	firstName: string;
	lastName: string;
	status: DriverStatus;
	route: string;
	rota: string;
	rotaWeek: number;
	replacementCandidates: ReplacementCandidate[];
};

export const generateOperationalIssues = async (
	pool: Pool,
): Promise<OperationalIssue[]> => {
	const driversResult = await pool.query(
		"SELECT * FROM drivers ORDER BY employee_number",
	);

	const drivers: Driver[] = driversResult.rows;

	const unavailableDrivers = drivers.filter(
		(driver) => driver.route !== "spare" && driver.status !== "available",
	);

	const availableSpareDrivers = drivers.filter(
		(driver) =>
			driver.route === "spare" &&
			driver.rota === "spare" &&
			driver.status === "available",
	);

	return unavailableDrivers.map((driver) => {
		const replacementCandidates = availableSpareDrivers
			.filter((spareDriver) => spareDriver.rota_week === driver.rota_week)
			.map((spareDriver) => ({
				employeeNumber: spareDriver.employee_number,
				batchNumber: spareDriver.batch_number,
				firstName: spareDriver.first_name,
				lastName: spareDriver.last_name,
				rotaWeek: spareDriver.rota_week,
			}));

		return {
			employeeNumber: driver.employee_number,
			firstName: driver.first_name,
			lastName: driver.last_name,
			status: driver.status,
			route: driver.route,
			rota: driver.rota,
			rotaWeek: driver.rota_week,
			replacementCandidates,
		};
	});
};
