import { useState, type FormEvent } from "react";

import styles from "./LoginPage.module.css";

type User = {
	id: number;
	username: string;
	role: "manager" | "garage_supervisor";
};

type LoginPageProps = {
	onLogin: (user: User, token: string) => void;
};

const LoginPage = ({ onLogin }: LoginPageProps) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setError(null);
		setLoading(true);

		try {
			const response = await fetch("http://localhost:3000/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Login failed");
			}

			onLogin(data.user, data.token);
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message);
			} else {
				setError("Login failed");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className={styles.page}>
			<section className={styles.loginCard}>
				<div className={styles.heading}>
					<p className={styles.systemName}>Bus Operations Simulator</p>
					<h1>Operations Login</h1>
					<p>Sign in to access the operations control system.</p>
				</div>

				<form
					className={styles.form}
					onSubmit={handleSubmit}>
					<label htmlFor='username'>Username</label>

					<input
						id='username'
						type='text'
						value={username}
						onChange={(event) => setUsername(event.target.value)}
						autoComplete='username'
						required
					/>

					<label htmlFor='password'>Password</label>

					<input
						id='password'
						type={showPassword ? "text" : "password"}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						autoComplete='current-password'
						required
					/>

					<label>
						<input
							type='checkbox'
							checked={showPassword}
							onChange={(event) => setShowPassword(event.target.checked)}
						/>
						Show password
					</label>

					{error && <p className={styles.error}>{error}</p>}

					<button
						type='submit'
						disabled={loading}>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>
			</section>
		</main>
	);
};

export default LoginPage;
