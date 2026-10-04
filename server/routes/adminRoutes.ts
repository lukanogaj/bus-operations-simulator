import { Router } from "express";
import type { Pool } from "pg";

import { authenticateUser, requireRole } from "../middleware/auth";
import {
	createUser,
	deleteUser,
	getUsers,
	updateUserPassword,
	updateUserRole,
} from "../services/adminService";

export const createAdminRouter = (pool: Pool) => {
	const router = Router();

	router.get(
		"/admin/users",
		authenticateUser,
		requireRole("manager"),
		async (req, res) => {
			try {
				const users = await getUsers(pool);

				res.json(users);
			} catch (error) {
				console.error("Error fetching admin users:", error);

				res.status(500).json({
					error: "Failed to fetch users",
				});
			}
		},
	);

	router.post(
		"/admin/users",
		authenticateUser,
		requireRole("manager"),
		async (req, res) => {
			try {
				const { username, password, role } = req.body;

				if (!username || !password || !role) {
					return res.status(400).json({
						error: "Username, password and role are required",
					});
				}

				if (role !== "manager" && role !== "garage_supervisor") {
					return res.status(400).json({
						error: "Invalid user role",
					});
				}

				const user = await createUser(pool, {
					username,
					password,
					role,
				});

				res.status(201).json(user);
			} catch (error) {
				console.error("Error creating admin user:", error);

				const message =
					error instanceof Error ? error.message : "Failed to create user";

				const status = message === "Username already exists" ? 409 : 500;

				res.status(status).json({
					error: message,
				});
			}
		},
	);

	router.patch(
		"/admin/users/:id/role",
		authenticateUser,
		requireRole("manager"),
		async (req, res) => {
			try {
				const userId = Number(req.params.id);
				const { role } = req.body;

				if (!Number.isInteger(userId) || userId <= 0) {
					return res.status(400).json({
						error: "Invalid user ID",
					});
				}

				if (role !== "manager" && role !== "garage_supervisor") {
					return res.status(400).json({
						error: "Invalid user role",
					});
				}

				const user = await updateUserRole(pool, userId, role);

				res.json(user);
			} catch (error) {
				console.error("Error updating user role:", error);

				const message =
					error instanceof Error ? error.message : "Failed to update user role";

				const status = message === "User not found" ? 404 : 500;

				res.status(status).json({
					error: message,
				});
			}
		},
	);

	router.patch(
		"/admin/users/:id/password",
		authenticateUser,
		requireRole("manager"),
		async (req, res) => {
			try {
				const userId = Number(req.params.id);
				const { password } = req.body;

				if (!Number.isInteger(userId) || userId <= 0) {
					return res.status(400).json({
						error: "Invalid user ID",
					});
				}

				if (!password) {
					return res.status(400).json({
						error: "Password is required",
					});
				}

				await updateUserPassword(pool, userId, password);

				res.json({
					message: "Password updated successfully",
				});
			} catch (error) {
				console.error("Error updating user password:", error);

				const message =
					error instanceof Error
						? error.message
						: "Failed to update user password";

				const status = message === "User not found" ? 404 : 500;

				res.status(status).json({
					error: message,
				});
			}
		},
	);

	router.delete(
		"/admin/users/:id",
		authenticateUser,
		requireRole("manager"),
		async (req, res) => {
			try {
				const userId = Number(req.params.id);

				if (!Number.isInteger(userId) || userId <= 0) {
					return res.status(400).json({
						error: "Invalid user ID",
					});
				}

				if (req.user?.userId === userId) {
					return res.status(400).json({
						error: "You cannot delete your own account",
					});
				}

				await deleteUser(pool, userId);

				res.status(204).send();
			} catch (error) {
				console.error("Error deleting admin user:", error);

				const message =
					error instanceof Error ? error.message : "Failed to delete user";

				const status = message === "User not found" ? 404 : 500;

				res.status(status).json({
					error: message,
				});
			}
		},
	);

	return router;
};
