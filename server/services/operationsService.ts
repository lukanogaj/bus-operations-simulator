import type { Pool } from "pg";

import { generateWeeklySnapshot } from "./rotaService";

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
	dutyNumber: number;
	assignmentDate: string;
	replacementCandidates: ReplacementCandidate[];
};

type CreateReplacementAssignment = {
	absentDriverNumber: number;
	replacementDriverNumber: number;
	dutyNumber: number;
	assignmentDate: string;
};

const getTodayName = () => {
	const days = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	] as const;

	return days[new Date().getDay()];
};

const getTodayDate = () => {
	const today = new Date();

	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

export const generateOperationalIssues = async (
	pool: Pool,
): Promise<OperationalIssue[]> => {
	const currentDate = new Date();
	const startDate = new Date("2026-01-01");

	const snapshot = await generateWeeklySnapshot(pool, startDate, currentDate);

	const driversResult = await pool.query(
		"SELECT * FROM drivers ORDER BY employee_number",
	);

	const assignmentsResult = await pool.query(
		`SELECT replacement_driver_number
		 FROM replacement_assignments
		 WHERE assignment_date = CURRENT_DATE`,
	);

	const drivers: Driver[] = driversResult.rows;

	const assignedDriverNumbers = new Set<number>(
		assignmentsResult.rows.map(
			(assignment) => assignment.replacement_driver_number,
		),
	);

	const unavailableDrivers = drivers.filter(
		(driver) => driver.route !== "spare" && driver.status !== "available",
	);

	const availableSpareDrivers = drivers.filter(
		(driver) =>
			driver.route === "spare" &&
			driver.rota === "spare" &&
			driver.status === "available" &&
			!assignedDriverNumbers.has(driver.employee_number),
	);

	const todayName = getTodayName();
	const assignmentDate = getTodayDate();

	const issues: OperationalIssue[] = [];

	for (const driver of unavailableDrivers) {
		const routeAllocation = snapshot.rota.find(
			(route) => route.route === driver.route,
		);

		if (!routeAllocation) {
			continue;
		}

		if (
			driver.rota !== "early" &&
			driver.rota !== "middle" &&
			driver.rota !== "late"
		) {
			continue;
		}

		const rotaRows = routeAllocation.allocation[driver.rota];

		const driverRow = rotaRows.find(
			(row) => row.employeeNumber === driver.employee_number,
		);

		if (!driverRow) {
			continue;
		}

		const duty = driverRow[todayName];

		if (typeof duty !== "number") {
			continue;
		}

		const replacementCandidates = availableSpareDrivers
			.filter((spareDriver) => spareDriver.rota_week === driver.rota_week)
			.map((spareDriver) => ({
				employeeNumber: spareDriver.employee_number,
				batchNumber: spareDriver.batch_number,
				firstName: spareDriver.first_name,
				lastName: spareDriver.last_name,
				rotaWeek: spareDriver.rota_week,
			}));

		issues.push({
			employeeNumber: driver.employee_number,
			firstName: driver.first_name,
			lastName: driver.last_name,
			status: driver.status,
			route: driver.route,
			rota: driver.rota,
			rotaWeek: driverRow.rotaWeek,
			dutyNumber: duty,
			assignmentDate,
			replacementCandidates,
		});
	}

	return issues;
};

export const createReplacementAssignment = async (
	pool: Pool,
	assignment: CreateReplacementAssignment,
) => {
	const {
		absentDriverNumber,
		replacementDriverNumber,
		dutyNumber,
		assignmentDate,
	} = assignment;

	const absentDriverResult = await pool.query(
		`SELECT *
		 FROM drivers
		 WHERE employee_number = $1`,
		[absentDriverNumber],
	);

	const absentDriver: Driver | undefined = absentDriverResult.rows[0];

	if (!absentDriver) {
		throw new Error("Absent driver not found");
	}

	if (absentDriver.status === "available") {
		throw new Error("Driver is currently available");
	}

	const replacementDriverResult = await pool.query(
		`SELECT *
		 FROM drivers
		 WHERE employee_number = $1`,
		[replacementDriverNumber],
	);

	const replacementDriver: Driver | undefined = replacementDriverResult.rows[0];

	if (!replacementDriver) {
		throw new Error("Replacement driver not found");
	}

	if (
		replacementDriver.route !== "spare" ||
		replacementDriver.rota !== "spare" ||
		replacementDriver.status !== "available"
	) {
		throw new Error("Replacement driver is not an available spare");
	}

	const dutyResult = await pool.query(
		`SELECT duty_number, route, rota
		 FROM duties
		 WHERE duty_number = $1`,
		[dutyNumber],
	);

	const duty = dutyResult.rows[0];

	if (!duty) {
		throw new Error("Duty not found");
	}

	if (duty.route !== absentDriver.route || duty.rota !== absentDriver.rota) {
		throw new Error("Duty does not match the absent driver's allocation");
	}

	const existingAssignmentResult = await pool.query(
		`SELECT id
		 FROM replacement_assignments
		 WHERE replacement_driver_number = $1
		   AND assignment_date = $2`,
		[replacementDriverNumber, assignmentDate],
	);

	if (existingAssignmentResult.rowCount) {
		throw new Error("Replacement driver is already assigned on this date");
	}

	const result = await pool.query(
		`INSERT INTO replacement_assignments (
			absent_driver_number,
			replacement_driver_number,
			duty_number,
			assignment_date
		)
		VALUES ($1, $2, $3, $4)
		RETURNING *`,
		[absentDriverNumber, replacementDriverNumber, dutyNumber, assignmentDate],
	);

	return result.rows[0];
};
