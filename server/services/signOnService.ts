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

	return result.rows;
};
