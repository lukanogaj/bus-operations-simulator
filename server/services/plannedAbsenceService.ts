import type { Pool } from "pg";

export type PlannedAbsenceType = "HOLIDAY" | "TRAINING";

export type CreatePlannedAbsenceInput = {
	driverNumber: number;
	absenceType: PlannedAbsenceType;
	startDate: string;
	endDate: string;
	notes?: string;
};

const mapPlannedAbsence = (row: Record<string, unknown>) => ({
	id: row.id,
	driverNumber: row.driver_number,
	absenceType: row.absence_type,
	startDate: row.start_date,
	endDate: row.end_date,
	notes: row.notes,
	createdAt: row.created_at,
});

export const getPlannedAbsences = async (pool: Pool) => {
	const result = await pool.query(
		`SELECT
			id,
			driver_number,
			absence_type,
			start_date::text AS start_date,
			end_date::text AS end_date,
			notes,
			created_at
		FROM planned_absences
		ORDER BY start_date, driver_number`,
	);

	return result.rows.map(mapPlannedAbsence);
};

export const createPlannedAbsence = async (
	pool: Pool,
	input: CreatePlannedAbsenceInput,
) => {
	const driverResult = await pool.query(
		`SELECT employee_number
		FROM drivers
		WHERE employee_number = $1`,
		[input.driverNumber],
	);

	if (driverResult.rows.length === 0) {
		throw new Error("Driver not found");
	}

	if (!["HOLIDAY", "TRAINING"].includes(input.absenceType)) {
		throw new Error("Invalid absence type");
	}

	if (input.endDate < input.startDate) {
		throw new Error("End date cannot be before start date");
	}

	const overlappingResult = await pool.query(
		`SELECT id
		FROM planned_absences
		WHERE driver_number = $1
			AND start_date <= $3
			AND end_date >= $2
		LIMIT 1`,
		[input.driverNumber, input.startDate, input.endDate],
	);

	if (overlappingResult.rows.length > 0) {
		throw new Error("Driver already has a planned absence in this date range");
	}

	const result = await pool.query(
		`INSERT INTO planned_absences (
			driver_number,
			absence_type,
			start_date,
			end_date,
			notes
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING
			id,
			driver_number,
			absence_type,
			start_date::text AS start_date,
			end_date::text AS end_date,
			notes,
			created_at`,
		[
			input.driverNumber,
			input.absenceType,
			input.startDate,
			input.endDate,
			input.notes?.trim() || null,
		],
	);

	return mapPlannedAbsence(result.rows[0]);
};

export const deletePlannedAbsence = async (
	pool: Pool,
	absenceId: number,
) => {
	const result = await pool.query(
		`DELETE FROM planned_absences
		WHERE id = $1
		RETURNING id`,
		[absenceId],
	);

	if (result.rows.length === 0) {
		throw new Error("Planned absence not found");
	}

	return { id: result.rows[0].id };
};
