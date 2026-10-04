import { Router } from "express";
import type { Pool } from "pg";

import { authenticateUser } from "../middleware/auth";
import { generateWeeklySnapshot } from "../services/rotaService";
import {
	createIncident,
	getIncidents,
	resolveIncident,
} from "../services/incidentService";
import { getOperationalReport } from "../services/reportService";

export const createCoreRouter = (pool: Pool) => {
	const router = Router();

	router.get("/drivers", authenticateUser, async (req, res) => {
		try {
			const result = await pool.query(
				"SELECT * FROM drivers ORDER BY employee_number",
			);

			const drivers = result.rows.map((row) => ({
				employeeNumber: row.employee_number,
				batchNumber: row.batch_number,
				firstName: row.first_name,
				lastName: row.last_name,
				status: row.status,
				rota: row.rota,
				rotaWeek: row.rota_week,
				route: row.route,
			}));

			res.json(drivers);
		} catch (error) {
			console.error("Error fetching drivers:", error);

			res.status(500).json({
				error: "Failed to fetch drivers",
			});
		}
	});

	router.get("/duties", authenticateUser, async (req, res) => {
		try {
			const result = await pool.query(
				"SELECT * FROM duties ORDER BY duty_number",
			);

			const duties = result.rows.map((row) => ({
				dutyNumber: row.duty_number,
				route: row.route,
				rota: row.rota,
				signOn: row.sign_on,
				signOff: row.sign_off,
			}));

			res.json(duties);
		} catch (error) {
			console.error("Error fetching duties:", error);

			res.status(500).json({
				error: "Failed to fetch duties",
			});
		}
	});

	router.get("/routes", authenticateUser, async (req, res) => {
		try {
			const result = await pool.query(
				"SELECT * FROM routes ORDER BY route_number",
			);

			const routes = result.rows.map((row) => ({
				routeNumber: row.route_number,
			}));

			res.json(routes);
		} catch (error) {
			console.error("Error fetching routes:", error);

			res.status(500).json({
				error: "Failed to fetch routes",
			});
		}
	});

	router.get("/weekly-snapshot", authenticateUser, async (req, res) => {
		try {
			const startDate = new Date("2026-01-01");
			const currentDate = new Date();

			const snapshot = await generateWeeklySnapshot(
				pool,
				startDate,
				currentDate,
			);

			res.json(snapshot);
		} catch (error) {
			console.error("Error generating weekly snapshot:", error);

			res.status(500).json({
				error: "Failed to generate weekly snapshot",
			});
		}
	});

	router.get("/incidents", authenticateUser, async (req, res) => {
		try {
			const incidents = await getIncidents(pool);

			res.json(incidents);
		} catch (error) {
			console.error("Error fetching incidents:", error);

			res.status(500).json({
				error: "Failed to fetch incidents",
			});
		}
	});

	router.post("/incidents", authenticateUser, async (req, res) => {
		try {
			const { incidentType, description, route, driverNumber } = req.body;

			if (!incidentType || !description) {
				return res.status(400).json({
					error: "Incident type and description are required",
				});
			}

			const incident = await createIncident(pool, {
				incidentType,
				description,
				route,
				driverNumber,
			});

			res.status(201).json(incident);
		} catch (error) {
			console.error("Error creating incident:", error);

			if (
				error instanceof Error &&
				(error.message === "Driver number does not exist" ||
					error.message === "Route does not exist")
			) {
				return res.status(400).json({
					error: error.message,
				});
			}

			res.status(500).json({
				error: "Failed to create incident",
			});
		}
	});

	router.patch("/incidents/:id/resolve", authenticateUser, async (req, res) => {
		try {
			const incidentId = Number(req.params.id);

			if (!Number.isInteger(incidentId)) {
				return res.status(400).json({
					error: "Invalid incident ID",
				});
			}

			const incident = await resolveIncident(pool, incidentId);

			res.json(incident);
		} catch (error) {
			console.error("Error resolving incident:", error);

			const message =
				error instanceof Error ? error.message : "Failed to resolve incident";

			const status = message === "Incident not found" ? 404 : 500;

			res.status(status).json({
				error: message,
			});
		}
	});

	router.get("/reports", authenticateUser, async (req, res) => {
		try {
			const { from, to } = req.query;

			if (typeof from !== "string" || typeof to !== "string") {
				return res.status(400).json({
					error: "From and to dates are required",
				});
			}

			const datePattern = /^\d{4}-\d{2}-\d{2}$/;

			if (!datePattern.test(from) || !datePattern.test(to)) {
				return res.status(400).json({
					error: "Dates must use YYYY-MM-DD format",
				});
			}

			const fromDate = new Date(`${from}T12:00:00`);
			const toDate = new Date(`${to}T12:00:00`);

			if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
				return res.status(400).json({
					error: "Invalid report date range",
				});
			}

			if (fromDate > toDate) {
				return res.status(400).json({
					error: "From date cannot be after to date",
				});
			}

			const report = await getOperationalReport(pool, from, to);

			res.json(report);
		} catch (error) {
			console.error("Error generating operational report:", error);

			res.status(500).json({
				error: "Failed to generate operational report",
			});
		}
	});

	return router;
};
