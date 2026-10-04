import type { Pool } from "pg";

type ReportSummaryRow = {
	total: string;
	signed_on: string;
	late: string;
	absent: string;
	expected: string;
	due: string;
};

type IncidentSummaryRow = {
	total: string;
	open: string;
	resolved: string;
};

type ReplacementSummaryRow = {
	total: string;
};

type SignOnHistoryRow = {
	id: number;
	operational_date: string;
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

type IncidentHistoryRow = {
	id: number;
	incident_type: string;
	description: string;
	status: string;
	route: string | null;
	driver_number: number | null;
	created_at: Date;
	resolved_at: Date | null;
};

type ReplacementHistoryRow = {
	id: number;
	assignment_date: string;
	absent_driver_number: number;
	absent_first_name: string;
	absent_last_name: string;
	replacement_driver_number: number;
	replacement_first_name: string;
	replacement_last_name: string;
	duty_number: number;
	route: string;
	created_at: Date;
};

export const getOperationalReport = async (
	pool: Pool,
	from: string,
	to: string,
) => {
	const signOnSummaryResult = await pool.query<ReportSummaryRow>(
		`SELECT
			COUNT(*)::text AS total,
			COUNT(*) FILTER (WHERE status = 'SIGNED_ON')::text AS signed_on,
			COUNT(*) FILTER (WHERE status = 'LATE')::text AS late,
			COUNT(*) FILTER (WHERE status = 'ABSENT')::text AS absent,
			COUNT(*) FILTER (WHERE status = 'EXPECTED')::text AS expected,
			COUNT(*) FILTER (WHERE status = 'DUE')::text AS due
		 FROM sign_on_entries
		 WHERE operational_date BETWEEN $1 AND $2`,
		[from, to],
	);

	const incidentSummaryResult = await pool.query<IncidentSummaryRow>(
		`SELECT
			COUNT(*)::text AS total,
			COUNT(*) FILTER (WHERE status = 'open')::text AS open,
			COUNT(*) FILTER (WHERE status = 'resolved')::text AS resolved
		 FROM incidents
		 WHERE created_at::date BETWEEN $1 AND $2`,
		[from, to],
	);

	const replacementSummaryResult = await pool.query<ReplacementSummaryRow>(
		`SELECT
			COUNT(*)::text AS total
		 FROM replacement_assignments
		 WHERE assignment_date BETWEEN $1 AND $2`,
		[from, to],
	);

	const signOnHistoryResult = await pool.query<SignOnHistoryRow>(
		`SELECT
			se.id,
			TO_CHAR(se.operational_date, 'YYYY-MM-DD') AS operational_date,
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
		 WHERE se.operational_date BETWEEN $1 AND $2
		 ORDER BY se.operational_date DESC, du.sign_on, se.duty_number`,
		[from, to],
	);

	const incidentHistoryResult = await pool.query<IncidentHistoryRow>(
		`SELECT
			id,
			incident_type,
			description,
			status,
			route,
			driver_number,
			created_at,
			resolved_at
		 FROM incidents
		 WHERE created_at::date BETWEEN $1 AND $2
		 ORDER BY created_at DESC`,
		[from, to],
	);

	const replacementHistoryResult = await pool.query<ReplacementHistoryRow>(
		`SELECT
			ra.id,
			TO_CHAR(ra.assignment_date, 'YYYY-MM-DD') AS assignment_date,
			ra.absent_driver_number,
			absent_driver.first_name AS absent_first_name,
			absent_driver.last_name AS absent_last_name,
			ra.replacement_driver_number,
			replacement_driver.first_name AS replacement_first_name,
			replacement_driver.last_name AS replacement_last_name,
			ra.duty_number,
			du.route,
			ra.created_at
		 FROM replacement_assignments ra
		 JOIN drivers absent_driver
			ON absent_driver.employee_number = ra.absent_driver_number
		 JOIN drivers replacement_driver
			ON replacement_driver.employee_number = ra.replacement_driver_number
		 JOIN duties du
			ON du.duty_number = ra.duty_number
		 WHERE ra.assignment_date BETWEEN $1 AND $2
		 ORDER BY ra.assignment_date DESC, ra.duty_number`,
		[from, to],
	);

	const signOnSummary = signOnSummaryResult.rows[0];
	const incidentSummary = incidentSummaryResult.rows[0];
	const replacementSummary = replacementSummaryResult.rows[0];

	return {
		range: {
			from,
			to,
		},
		summary: {
			signOn: {
				total: Number(signOnSummary.total),
				signedOn: Number(signOnSummary.signed_on),
				late: Number(signOnSummary.late),
				absent: Number(signOnSummary.absent),
				expected: Number(signOnSummary.expected),
				due: Number(signOnSummary.due),
			},
			incidents: {
				total: Number(incidentSummary.total),
				open: Number(incidentSummary.open),
				resolved: Number(incidentSummary.resolved),
			},
			replacements: {
				total: Number(replacementSummary.total),
			},
		},
		signOnHistory: signOnHistoryResult.rows.map((row) => ({
			id: row.id,
			operationalDate: row.operational_date,
			driverNumber: row.driver_number,
			firstName: row.first_name,
			lastName: row.last_name,
			dutyNumber: row.duty_number,
			route: row.route,
			signOn: row.sign_on,
			signOff: row.sign_off,
			signedOnAt: row.signed_on_at,
			status: row.status,
		})),
		incidentHistory: incidentHistoryResult.rows.map((row) => ({
			id: row.id,
			incidentType: row.incident_type,
			description: row.description,
			status: row.status,
			route: row.route,
			driverNumber: row.driver_number,
			createdAt: row.created_at,
			resolvedAt: row.resolved_at,
		})),
		replacementHistory: replacementHistoryResult.rows.map((row) => ({
			id: row.id,
			assignmentDate: row.assignment_date,
			absentDriverNumber: row.absent_driver_number,
			absentFirstName: row.absent_first_name,
			absentLastName: row.absent_last_name,
			replacementDriverNumber: row.replacement_driver_number,
			replacementFirstName: row.replacement_first_name,
			replacementLastName: row.replacement_last_name,
			dutyNumber: row.duty_number,
			route: row.route,
			createdAt: row.created_at,
		})),
	};
};
