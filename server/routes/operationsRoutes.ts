import { Router, type Request, type Response } from "express";
import type { Pool } from "pg";

import { authenticateUser } from "../middleware/auth";
import {
	createReplacementAssignment,
	generateOperationalIssues,
} from "../services/operationsService";
import { recommendReplacement } from "../services/aiAssistantService";
import {
	generateSignOnSheet,
	getSignOnSheet,
	markDriverAbsent,
	signOnDriver,
} from "../services/signOnService";
import {
	createPlannedAbsence,
	deletePlannedAbsence,
	getPlannedAbsences,
} from "../services/plannedAbsenceService";

export const createOperationsRouter = (pool: Pool) => {
	const router = Router();

	router.get("/operations/issues", authenticateUser, async (req, res) => {
		try {
			const { date } = req.query;

			if (date !== undefined && typeof date !== "string") {
				return res.status(400).json({
					error: "Invalid operational date",
				});
			}

			if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
				return res.status(400).json({
					error: "Operational date must use YYYY-MM-DD format",
				});
			}

			const issues = await generateOperationalIssues(pool, date);

			res.json(issues);
		} catch (error) {
			console.error("Error generating operational issues:", error);

			res.status(500).json({
				error: "Failed to generate operational issues",
			});
		}
	});

	router.post(
		"/operations/ai-recommendation",
		authenticateUser,
		async (req, res) => {
			try {
				const { employeeNumber, dutyNumber, assignmentDate } = req.body;

				if (!employeeNumber || !dutyNumber || !assignmentDate) {
					return res.status(400).json({
						error:
							"Employee number, duty number and assignment date are required",
					});
				}

				const issues = await generateOperationalIssues(pool);

				const issue = issues.find(
					(item) =>
						item.employeeNumber === Number(employeeNumber) &&
						item.dutyNumber === Number(dutyNumber) &&
						item.assignmentDate === assignmentDate,
				);

				if (!issue) {
					return res.status(404).json({
						error: "Operational issue not found",
					});
				}

				if (issue.coverageStatus === "COVERED") {
					return res.status(409).json({
						error: "This issue is already covered",
					});
				}

				if (issue.replacementCandidates.length === 0) {
					return res.status(409).json({
						error: "No valid replacement candidates available",
					});
				}

				const recommendation = await recommendReplacement(
					issue.replacementCandidates,
				);

				res.json({
					recommendation,
				});
			} catch (error) {
				console.error("Error generating AI recommendation:", error);

				const message =
					error instanceof Error
						? error.message
						: "Failed to generate AI recommendation";

				res.status(500).json({
					error: message,
				});
			}
		},
	);

	router.post("/operations/assignments", authenticateUser, async (req, res) => {
		try {
			const {
				absentDriverNumber,
				replacementDriverNumber,
				dutyNumber,
				assignmentDate,
			} = req.body;

			if (
				!absentDriverNumber ||
				!replacementDriverNumber ||
				!dutyNumber ||
				!assignmentDate
			) {
				return res.status(400).json({
					error: "All assignment fields are required",
				});
			}

			const assignment = await createReplacementAssignment(pool, {
				absentDriverNumber,
				replacementDriverNumber,
				dutyNumber,
				assignmentDate,
			});

			res.status(201).json(assignment);
		} catch (error) {
			console.error("Error creating replacement assignment:", error);

			const message =
				error instanceof Error
					? error.message
					: "Failed to create replacement assignment";

			res.status(400).json({
				error: message,
			});
		}
	});

	router.get(
		"/sign-on/:date",
		authenticateUser,
		async (req: Request<{ date: string }>, res: Response) => {
			try {
				const { date } = req.params;
				const datePattern = /^\d{4}-\d{2}-\d{2}$/;

				if (!datePattern.test(date)) {
					return res.status(400).json({
						error: "Operational date must use YYYY-MM-DD format",
					});
				}

				const sheet = await getSignOnSheet(pool, date);

				res.json(sheet);
			} catch (error) {
				console.error("Error fetching sign-on sheet:", error);

				res.status(500).json({
					error: "Failed to fetch sign-on sheet",
				});
			}
		},
	);

	router.post("/sign-on/generate", authenticateUser, async (req, res) => {
		try {
			const { operationalDate } = req.body;

			if (!operationalDate) {
				return res.status(400).json({
					error: "Operational date is required",
				});
			}

			const datePattern = /^\d{4}-\d{2}-\d{2}$/;

			if (!datePattern.test(operationalDate)) {
				return res.status(400).json({
					error: "Operational date must use YYYY-MM-DD format",
				});
			}

			const date = new Date(`${operationalDate}T12:00:00`);

			if (Number.isNaN(date.getTime())) {
				return res.status(400).json({
					error: "Invalid operational date",
				});
			}

			const sheet = await generateSignOnSheet(pool, date);

			res.status(201).json(sheet);
		} catch (error) {
			console.error("Error generating sign-on sheet:", error);

			res.status(500).json({
				error: "Failed to generate sign-on sheet",
			});
		}
	});

	router.patch(
		"/sign-on/:id/sign-on",
		authenticateUser,
		async (req: Request<{ id: string }>, res: Response) => {
			try {
				const entryId = Number(req.params.id);

				if (!Number.isInteger(entryId) || entryId <= 0) {
					return res.status(400).json({
						error: "Invalid sign-on entry ID",
					});
				}

				const entry = await signOnDriver(pool, entryId);

				res.json(entry);
			} catch (error) {
				console.error("Error signing on driver:", error);

				const message =
					error instanceof Error ? error.message : "Failed to sign on driver";

				const status =
					message === "Sign-on entry not found"
						? 404
						: message === "Too late to sign on — contact the Counter" ||
							  message === "Driver is already signed on" ||
							  message === "Driver is marked absent — contact the Counter"
							? 409
							: 500;

				res.status(status).json({
					error: message,
				});
			}
		},
	);

	router.patch(
		"/sign-on/:id/absent",
		authenticateUser,
		async (req: Request<{ id: string }>, res: Response) => {
			try {
				const entryId = Number(req.params.id);

				if (!Number.isInteger(entryId) || entryId <= 0) {
					return res.status(400).json({
						error: "Invalid sign-on entry ID",
					});
				}

				const entry = await markDriverAbsent(pool, entryId);

				res.json(entry);
			} catch (error) {
				console.error("Error marking driver absent:", error);

				const message =
					error instanceof Error
						? error.message
						: "Failed to mark driver absent";

				const status =
					message === "Sign-on entry not found"
						? 404
						: message === "Only a late driver can be marked absent"
							? 409
							: 500;

				res.status(status).json({
					error: message,
				});
			}
		},
	);

	router.get("/planned-absences", authenticateUser, async (req, res) => {
		try {
			const absences = await getPlannedAbsences(pool);

			res.json(absences);
		} catch (error) {
			console.error("Error fetching planned absences:", error);

			res.status(500).json({
				error: "Failed to fetch planned absences",
			});
		}
	});

	router.post("/planned-absences", authenticateUser, async (req, res) => {
		try {
			const { driverNumber, absenceType, startDate, endDate, notes } = req.body;

			if (!driverNumber || !absenceType || !startDate || !endDate) {
				return res.status(400).json({
					error:
						"Driver number, absence type, start date and end date are required",
				});
			}

			const absence = await createPlannedAbsence(pool, {
				driverNumber: Number(driverNumber),
				absenceType,
				startDate,
				endDate,
				notes,
			});

			res.status(201).json(absence);
		} catch (error) {
			console.error("Error creating planned absence:", error);

			const message =
				error instanceof Error
					? error.message
					: "Failed to create planned absence";

			res.status(400).json({
				error: message,
			});
		}
	});

	router.delete("/planned-absences/:id", authenticateUser, async (req, res) => {
		try {
			const absenceId = Number(req.params.id);

			if (!Number.isInteger(absenceId) || absenceId <= 0) {
				return res.status(400).json({
					error: "Invalid planned absence ID",
				});
			}

			await deletePlannedAbsence(pool, absenceId);

			res.status(204).send();
		} catch (error) {
			console.error("Error deleting planned absence:", error);

			const message =
				error instanceof Error
					? error.message
					: "Failed to delete planned absence";

			const status = message === "Planned absence not found" ? 404 : 500;

			res.status(status).json({
				error: message,
			});
		}
	});

	return router;
};
