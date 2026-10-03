import bcrypt from "bcrypt";
import type { Pool } from "pg";

export type AdminUserRole = "manager" | "garage_supervisor";

export type AdminUser = {
	id: number;
	username: string;
	role: AdminUserRole;
};

export type CreateAdminUserInput = {
	username: string;
	password: string;
	role: AdminUserRole;
};

export const getUsers = async (pool: Pool): Promise<AdminUser[]> => {
	const result = await pool.query(
		`SELECT id, username, role
		 FROM users
		 ORDER BY id`,
	);

	return result.rows.map((row) => ({
		id: row.id,
		username: row.username,
		role: row.role,
	}));
};

export const createUser = async (
	pool: Pool,
	input: CreateAdminUserInput,
): Promise<AdminUser> => {
	const passwordHash = await bcrypt.hash(input.password, 12);

	try {
		const result = await pool.query(
			`INSERT INTO users (username, password_hash, role)
			 VALUES ($1, $2, $3)
			 RETURNING id, username, role`,
			[input.username, passwordHash, input.role],
		);

		return {
			id: result.rows[0].id,
			username: result.rows[0].username,
			role: result.rows[0].role,
		};
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "23505") {
			throw new Error("Username already exists");
		}

		throw error;
	}
};

export const updateUserRole = async (
	pool: Pool,
	userId: number,
	role: AdminUserRole,
): Promise<AdminUser> => {
	const result = await pool.query(
		`UPDATE users
		 SET role = $1
		 WHERE id = $2
		 RETURNING id, username, role`,
		[role, userId],
	);

	if (result.rows.length === 0) {
		throw new Error("User not found");
	}

	return {
		id: result.rows[0].id,
		username: result.rows[0].username,
		role: result.rows[0].role,
	};
};

export const updateUserPassword = async (
	pool: Pool,
	userId: number,
	password: string,
): Promise<void> => {
	const passwordHash = await bcrypt.hash(password, 12);

	const result = await pool.query(
		`UPDATE users
		 SET password_hash = $1
		 WHERE id = $2`,
		[passwordHash, userId],
	);

	if (result.rowCount === 0) {
		throw new Error("User not found");
	}
};

export const deleteUser = async (pool: Pool, userId: number): Promise<void> => {
	const result = await pool.query(
		`DELETE FROM users
		 WHERE id = $1`,
		[userId],
	);

	if (result.rowCount === 0) {
		throw new Error("User not found");
	}
};
