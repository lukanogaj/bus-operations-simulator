import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import styles from "./AdminPage.module.css";

import { apiFetch } from "../../config/apiClient";

type UserRole = "manager" | "garage_supervisor";

type AdminUser = {
	id: number;
	username: string;
	role: UserRole;
};

const getErrorMessage = async (
	response: Response,
	fallbackMessage: string,
): Promise<string> => {
	const text = await response.text();

	if (!text) {
		return fallbackMessage;
	}

	try {
		const data = JSON.parse(text);

		if (data && typeof data.error === "string") {
			return data.error;
		}

		return fallbackMessage;
	} catch {
		return text;
	}
};

const AdminPage = () => {
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<UserRole>("garage_supervisor");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [actionUserId, setActionUserId] = useState<number | null>(null);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");

	const token = localStorage.getItem("token");

	const storedUser = localStorage.getItem("user");

	const currentUser: AdminUser | null = storedUser
		? JSON.parse(storedUser)
		: null;

	const loadUsers = useCallback(async () => {
		try {
			setError("");

			const response = await apiFetch("/admin/users", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorMessage = await getErrorMessage(
					response,
					"Failed to load users",
				);

				throw new Error(errorMessage);
			}

			const data: AdminUser[] = await response.json();

			setUsers(data);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to load users");
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			setSubmitting(true);
			setError("");
			setMessage("");

			const response = await apiFetch("/admin/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					username,
					password,
					role,
				}),
			});

			if (!response.ok) {
				const errorMessage = await getErrorMessage(
					response,
					"Failed to create user",
				);

				throw new Error(errorMessage);
			}

			setUsername("");
			setPassword("");
			setRole("garage_supervisor");
			setMessage("User created successfully.");

			await loadUsers();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to create user",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleRoleChange = async (userId: number, newRole: UserRole) => {
		try {
			setActionUserId(userId);
			setError("");
			setMessage("");

			const response = await apiFetch(`/admin/users/${userId}/role`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					role: newRole,
				}),
			});

			if (!response.ok) {
				const errorMessage = await getErrorMessage(
					response,
					"Failed to update user role",
				);

				throw new Error(errorMessage);
			}

			setMessage("User role updated successfully.");

			await loadUsers();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to update user role",
			);

			await loadUsers();
		} finally {
			setActionUserId(null);
		}
	};

	const handlePasswordReset = async (userId: number, username: string) => {
		const newPassword = window.prompt(`Enter a new password for ${username}:`);

		if (!newPassword) {
			return;
		}

		try {
			setActionUserId(userId);
			setError("");
			setMessage("");

			const response = await apiFetch(`/admin/users/${userId}/password`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					password: newPassword,
				}),
			});

			if (!response.ok) {
				const errorMessage = await getErrorMessage(
					response,
					"Failed to update password",
				);

				throw new Error(errorMessage);
			}

			setMessage(`Password updated for ${username}.`);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to update password",
			);
		} finally {
			setActionUserId(null);
		}
	};

	const handleDeleteUser = async (user: AdminUser) => {
		const confirmed = window.confirm(
			`Delete user ${user.username}? This action cannot be undone.`,
		);

		if (!confirmed) {
			return;
		}

		try {
			setActionUserId(user.id);
			setError("");
			setMessage("");

			const response = await apiFetch(`/admin/users/${user.id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const errorMessage = await getErrorMessage(
					response,
					"Failed to delete user",
				);

				throw new Error(errorMessage);
			}

			setMessage("User deleted successfully.");

			await loadUsers();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to delete user",
			);
		} finally {
			setActionUserId(null);
		}
	};

	if (loading) {
		return (
			<section className={styles.page}>
				<h1>Admin</h1>
				<p>Loading users...</p>
			</section>
		);
	}

	return (
		<section className={styles.page}>
			<div className={styles.pageHeader}>
				<div>
					<h1>Admin</h1>
					<p>User accounts and role management.</p>
				</div>

				<div className={styles.userCount}>
					<span>Users</span>
					<strong>{users.length}</strong>
				</div>
			</div>

			{error && <div className={styles.error}>{error}</div>}
			{message && <div className={styles.success}>{message}</div>}

			<form
				className={styles.createForm}
				onSubmit={handleCreateUser}>
				<h2>Create User</h2>

				<div className={styles.formGrid}>
					<label>
						Username
						<input
							type='text'
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							placeholder='e.g. john.smith'
							autoComplete='off'
							required
						/>
					</label>

					<label>
						Password
						<input
							type='password'
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							autoComplete='new-password'
							required
						/>
					</label>

					<label>
						Role
						<select
							value={role}
							onChange={(event) => setRole(event.target.value as UserRole)}>
							<option value='garage_supervisor'>Garage Supervisor</option>
							<option value='manager'>Manager</option>
						</select>
					</label>
				</div>

				<button
					type='submit'
					disabled={submitting}>
					{submitting ? "Creating..." : "Create User"}
				</button>
			</form>

			<div className={styles.userSection}>
				<h2>System Users</h2>

				{users.length === 0 ? (
					<p>No users found.</p>
				) : (
					<div className={styles.tableWrapper}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>ID</th>
									<th>Username</th>
									<th>Role</th>
									<th>Actions</th>
								</tr>
							</thead>

							<tbody>
								{users.map((user) => {
									const isCurrentUser = currentUser?.id === user.id;
									const isBusy = actionUserId === user.id;

									return (
										<tr key={user.id}>
											<td>{user.id}</td>

											<td>
												<strong>{user.username}</strong>

												{isCurrentUser && (
													<span className={styles.youBadge}>You</span>
												)}
											</td>

											<td>
												<select
													className={styles.roleSelect}
													value={user.role}
													disabled={isBusy}
													onChange={(event) =>
														handleRoleChange(
															user.id,
															event.target.value as UserRole,
														)
													}>
													<option value='garage_supervisor'>
														Garage Supervisor
													</option>
													<option value='manager'>Manager</option>
												</select>
											</td>

											<td>
												<div className={styles.actions}>
													<button
														type='button'
														className={styles.passwordButton}
														disabled={isBusy}
														onClick={() =>
															handlePasswordReset(user.id, user.username)
														}>
														Reset Password
													</button>

													<button
														type='button'
														className={styles.deleteButton}
														disabled={isBusy || isCurrentUser}
														onClick={() => handleDeleteUser(user)}>
														Delete
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
};

export default AdminPage;
