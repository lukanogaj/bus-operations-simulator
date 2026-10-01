import { Pool } from "pg";

export type CreateIncidentInput = {
	incidentType: string;
	description: string;
	route?: string;
	driverNumber?: number;
};

export const getIncidents = async (pool: Pool) => {
	const result = await pool.query(
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
		 ORDER BY created_at DESC`,
	);

	return result.rows.map((row) => ({
		id: row.id,
		incidentType: row.incident_type,
		description: row.description,
		status: row.status,
		route: row.route,
		driverNumber: row.driver_number,
		createdAt: row.created_at,
		resolvedAt: row.resolved_at,
	}));
};

export const createIncident = async (
	pool: Pool,
	input: CreateIncidentInput,
) => {
	if (input.route) {
		const routeResult = await pool.query(
			`SELECT route_number
			 FROM routes
			 WHERE route_number = $1`,
			[input.route],
		);

		if (routeResult.rows.length === 0) {
			throw new Error("Route does not exist");
		}
	}

	if (input.driverNumber !== undefined) {
		const driverResult = await pool.query(
			`SELECT employee_number
			 FROM drivers
			 WHERE employee_number = $1`,
			[input.driverNumber],
		);

		if (driverResult.rows.length === 0) {
			throw new Error("Driver number does not exist");
		}
	}

	const result = await pool.query(
		`INSERT INTO incidents (
			incident_type,
			description,
			route,
			driver_number
		)
		VALUES ($1, $2, $3, $4)
		RETURNING
			id,
			incident_type,
			description,
			status,
			route,
			driver_number,
			created_at,
			resolved_at`,
		[
			input.incidentType,
			input.description,
			input.route ?? null,
			input.driverNumber ?? null,
		],
	);

	const row = result.rows[0];

	return {
		id: row.id,
		incidentType: row.incident_type,
		description: row.description,
		status: row.status,
		route: row.route,
		driverNumber: row.driver_number,
		createdAt: row.created_at,
		resolvedAt: row.resolved_at,
	};
};

export const resolveIncident = async (pool: Pool, incidentId: number) => {
	const result = await pool.query(
		`UPDATE incidents
		 SET
			status = 'resolved',
			resolved_at = CURRENT_TIMESTAMP
		 WHERE id = $1
		 RETURNING
			id,
			incident_type,
			description,
			status,
			route,
			driver_number,
			created_at,
			resolved_at`,
		[incidentId],
	);

	if (result.rows.length === 0) {
		throw new Error("Incident not found");
	}

	const row = result.rows[0];

	return {
		id: row.id,
		incidentType: row.incident_type,
		description: row.description,
		status: row.status,
		route: row.route,
		driverNumber: row.driver_number,
		createdAt: row.created_at,
		resolvedAt: row.resolved_at,
	};
};
