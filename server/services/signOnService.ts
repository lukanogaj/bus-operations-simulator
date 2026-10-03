import type { Pool } from "pg";

import { createReplacementAssignment } from "./operationsService";
import { generateWeeklySnapshot, getCurrentRotaWeek } from "./rotaService";

type DayName =
	| "sunday"
	| "monday"
	| "tuesday"
	| "wednesday"
	| "thursday"
	| "friday"
	| "saturday";

type RotaRow = {
	route: string;
	rota: string;
	employeeNumber: number;
	firstName: string;
	lastName: string;
	position: number;
	rotaWeek: number;
	saturday: number | "R";
	sunday: number | "R";
	monday: number | "R";
	tuesday: number | "R";
	wednesday: number | "R";
	thursday: number | "R";
	friday: number | "R";
};

type DriverStatusRow = {
	employee_number: number;
	status: string;
};

type SpareDriverRow = {
	employee_number: number;
	rota_week: number;
};

type ReplacementAssignmentRow = {
	absent_driver_number: number;
	replacement_driver_number: number;
	duty_number: number;
};

type SignOnRow = {
	id: number;
	operational_date: Date;
	driver_number: number;
	first_name: string;
	last_name: string;
	duty_number: number;
	route: string;
	sign_on: string;
	sign_off: string;
	signed_on_at: Date | null;
	status: string;
};

const ROTA_START_DATE = new Date("2026-01-01");

const getDayName = (date: Date): DayName => {
	const days: DayName[] = [
		"sunday",
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
	];

	return days[date.getDay()];
};

const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const getSignOnTimes = (operationalDate: string, signOn: string) => {
	const [hours, minutes] = signOn.split(":").map(Number);

	const signOnTime = new Date(`${operationalDate}T00:00:00`);
	signOnTime.setHours(hours, minutes, 0, 0);

	const dueTime = new Date(signOnTime.getTime() - 10 * 60 * 1000);

	return {
		signOnTime,
		dueTime,
	};
};

export const generateSignOnSheet = async (
	pool: Pool,
	operationalDate: Date,
) => {
	const snapshot = await generateWeeklySnapshot(
		pool,
		ROTA_START_DATE,
		operationalDate,
	);

	const dayName = getDayName(operationalDate);
	const date = formatDate(operationalDate);

	const driversResult = await pool.query(
		`SELECT employee_number, status
     FROM drivers`,
	);

	const spareDriversResult = await pool.query(
		`SELECT employee_number, rota_week
     FROM drivers
     WHERE rota = 'spare'
       AND route = 'spare'
       AND status = 'available'
     ORDER BY employee_number`,
	);

	const assignmentsResult = await pool.query(
		`SELECT
      absent_driver_number,
      replacement_driver_number,
      duty_number
     FROM replacement_assignments
     WHERE assignment_date = $1`,
		[date],
	);

	const drivers: DriverStatusRow[] = driversResult.rows;
	const spareDrivers: SpareDriverRow[] = spareDriversResult.rows;
	const assignments: ReplacementAssignmentRow[] = assignmentsResult.rows;

	const driverStatusByNumber = new Map<number, string>(
		drivers.map((driver) => [driver.employee_number, driver.status]),
	);

	const replacementByDuty = new Map<number, ReplacementAssignmentRow>(
		assignments.map((assignment) => [assignment.duty_number, assignment]),
	);

	const usedReplacementDrivers = new Set<number>(
		assignments.map((assignment) => assignment.replacement_driver_number),
	);

	let createdEntries = 0;
	let createdReplacementAssignments = 0;
	let uncoveredDuties = 0;

	for (const routeAllocation of snapshot.rota) {
		const rotaGroups = [
			routeAllocation.allocation.early,
			routeAllocation.allocation.middle,
			routeAllocation.allocation.late,
		];

		for (const rotaRows of rotaGroups) {
			for (const row of rotaRows as RotaRow[]) {
				const dutyNumber = row[dayName];

				if (typeof dutyNumber !== "number") {
					continue;
				}

				const nominalDriverStatus = driverStatusByNumber.get(
					row.employeeNumber,
				);

				if (!nominalDriverStatus) {
					continue;
				}

				let expectedDriverNumber: number | null = null;

				if (nominalDriverStatus === "available") {
					expectedDriverNumber = row.employeeNumber;
				} else {
					let replacementAssignment = replacementByDuty.get(dutyNumber);

					if (
						replacementAssignment &&
						replacementAssignment.absent_driver_number === row.employeeNumber
					) {
						expectedDriverNumber =
							replacementAssignment.replacement_driver_number;
					} else {
						const replacementCandidate = spareDrivers.find((spareDriver) => {
							if (usedReplacementDrivers.has(spareDriver.employee_number)) {
								return false;
							}

							const currentRotaWeek = getCurrentRotaWeek(
								spareDriver.rota_week,
								ROTA_START_DATE,
								operationalDate,
							);

							return currentRotaWeek === row.rotaWeek;
						});

						if (replacementCandidate) {
							const createdAssignment = await createReplacementAssignment(
								pool,
								{
									absentDriverNumber: row.employeeNumber,
									replacementDriverNumber: replacementCandidate.employee_number,
									dutyNumber,
									assignmentDate: date,
								},
							);

							replacementAssignment = {
								absent_driver_number: createdAssignment.absent_driver_number,
								replacement_driver_number:
									createdAssignment.replacement_driver_number,
								duty_number: createdAssignment.duty_number,
							};

							replacementByDuty.set(dutyNumber, replacementAssignment);

							usedReplacementDrivers.add(replacementCandidate.employee_number);

							createdReplacementAssignments += 1;
							expectedDriverNumber = replacementCandidate.employee_number;
						}
					}
				}

				if (expectedDriverNumber === null) {
					uncoveredDuties += 1;
					continue;
				}

				const result = await pool.query(
					`INSERT INTO sign_on_entries (
            operational_date,
            driver_number,
            duty_number,
            status
          )
          VALUES ($1, $2, $3, 'EXPECTED')
          ON CONFLICT DO NOTHING
          RETURNING id`,
					[date, expectedDriverNumber, dutyNumber],
				);

				createdEntries += result.rowCount ?? 0;
			}
		}
	}

	return {
		operationalDate: date,
		createdEntries,
		createdReplacementAssignments,
		uncoveredDuties,
	};
};

export const getSignOnSheet = async (pool: Pool, operationalDate: string) => {
	const result = await pool.query(
		`SELECT
      se.id,
      se.operational_date,
      se.driver_number,
      d.first_name,
      d.last_name,
      se.duty_number,
      du.route,
      du.sign_on,
      du.sign_off,
      se.signed_on_at,
      se.status
    FROM sign_on_entries se
    JOIN drivers d
      ON d.employee_number = se.driver_number
    JOIN duties du
      ON du.duty_number = se.duty_number
    WHERE se.operational_date = $1
    ORDER BY du.sign_on, se.duty_number`,
		[operationalDate],
	);

	const rows = result.rows as SignOnRow[];
	const now = new Date();

	for (const row of rows) {
		if (
			row.status === "SIGNED_ON" ||
			row.status === "ABSENT" ||
			row.status === "LATE"
		) {
			continue;
		}

		const { signOnTime } = getSignOnTimes(operationalDate, row.sign_on);

		if (now >= signOnTime) {
			await pool.query(
				`UPDATE sign_on_entries
         SET status = 'LATE'
         WHERE id = $1
           AND status NOT IN ('SIGNED_ON', 'ABSENT', 'LATE')`,
				[row.id],
			);

			row.status = "LATE";
		}
	}

	return rows.map((row) => {
		if (
			row.status === "SIGNED_ON" ||
			row.status === "ABSENT" ||
			row.status === "LATE"
		) {
			return row;
		}

		const { dueTime } = getSignOnTimes(operationalDate, row.sign_on);

		if (now >= dueTime) {
			return {
				...row,
				status: "DUE",
			};
		}

		return {
			...row,
			status: "EXPECTED",
		};
	});
};

export const signOnDriver = async (pool: Pool, entryId: number) => {
	const entryResult = await pool.query(
		`SELECT
      se.id,
      se.operational_date,
      se.driver_number,
      se.duty_number,
      se.status,
      se.signed_on_at,
      du.sign_on
     FROM sign_on_entries se
     JOIN duties du
       ON du.duty_number = se.duty_number
     WHERE se.id = $1`,
		[entryId],
	);

	if (entryResult.rowCount === 0) {
		throw new Error("Sign-on entry not found");
	}

	const entry = entryResult.rows[0];

	if (entry.status === "SIGNED_ON") {
		throw new Error("Driver is already signed on");
	}

	if (entry.status === "ABSENT") {
		throw new Error("Driver is marked absent — contact the Counter");
	}

	const operationalDate = formatDate(new Date(entry.operational_date));

	const { signOnTime } = getSignOnTimes(operationalDate, entry.sign_on);

	const now = new Date();

	if (entry.status === "LATE" || now >= signOnTime) {
		if (entry.status !== "LATE") {
			await pool.query(
				`UPDATE sign_on_entries
         SET status = 'LATE'
         WHERE id = $1
           AND status NOT IN ('SIGNED_ON', 'ABSENT')`,
				[entryId],
			);
		}

		throw new Error("Too late to sign on — contact the Counter");
	}

	const result = await pool.query(
		`UPDATE sign_on_entries
     SET
      status = 'SIGNED_ON',
      signed_on_at = CURRENT_TIMESTAMP
     WHERE id = $1
       AND status NOT IN ('SIGNED_ON', 'ABSENT', 'LATE')
     RETURNING
      id,
      operational_date,
      driver_number,
      duty_number,
      signed_on_at,
      status`,
		[entryId],
	);

	if (result.rowCount === 0) {
		throw new Error("Unable to sign on driver");
	}

	return result.rows[0];
};

export const markDriverAbsent = async (pool: Pool, entryId: number) => {
	const result = await pool.query(
		`UPDATE sign_on_entries
     SET status = 'ABSENT'
     WHERE id = $1
       AND status = 'LATE'
     RETURNING
      id,
      operational_date,
      driver_number,
      duty_number,
      signed_on_at,
      status`,
		[entryId],
	);

	if (result.rowCount === 0) {
		const entryResult = await pool.query(
			`SELECT status
       FROM sign_on_entries
       WHERE id = $1`,
			[entryId],
		);

		if (entryResult.rowCount === 0) {
			throw new Error("Sign-on entry not found");
		}

		throw new Error("Only a late driver can be marked absent");
	}

	return result.rows[0];
};
