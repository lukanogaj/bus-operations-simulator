import { useCallback, useEffect, useState } from "react";

import styles from "./SignOnPage.module.css";

type SignOnEntry = {
	id: number;
	operational_date: string;
	driver_number: number;
	first_name: string;
	last_name: string;
	duty_number: number;
	route: string;
	sign_on: string;
	sign_off: string;
	signed_on_at: string | null;
	status: "EXPECTED" | "DUE" | "SIGNED_ON" | "LATE" | "ABSENT";
};

const getLocalOperationalDate = () => {
	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const SignOnPage = () => {
	const [entries, setEntries] = useState<SignOnEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");
	const [signingOnId, setSigningOnId] = useState<number | null>(null);
	const [markingAbsentId, setMarkingAbsentId] = useState<number | null>(null);

	const operationalDate = getLocalOperationalDate();

	const fetchSignOnSheet = useCallback(async () => {
		const token = localStorage.getItem("token");

		const response = await fetch(
			`http://localhost:3000/sign-on/${operationalDate}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch sign-on sheet");
		}

		const data: SignOnEntry[] = await response.json();

		setEntries(data);
	}, [operationalDate]);

	useEffect(() => {
		const loadSignOnSheet = async () => {
			try {
				setLoading(true);
				setError("");

				await fetchSignOnSheet();
			} catch (error) {
				console.error("Error fetching sign-on sheet:", error);
				setError("Unable to load Sign-On Sheet.");
			} finally {
				setLoading(false);
			}
		};

		loadSignOnSheet();
	}, [fetchSignOnSheet]);

	const handleSignOn = async (entryId: number) => {
		try {
			setSigningOnId(entryId);
			setActionError("");

			const token = localStorage.getItem("token");

			const response = await fetch(
				`http://localhost:3000/sign-on/${entryId}/sign-on`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to sign on driver");
			}

			await fetchSignOnSheet();
		} catch (error) {
			console.error("Error signing on driver:", error);

			const message =
				error instanceof Error ? error.message : "Failed to sign on driver";

			setActionError(message);

			try {
				await fetchSignOnSheet();
			} catch (refreshError) {
				console.error("Error refreshing sign-on sheet:", refreshError);
			}
		} finally {
			setSigningOnId(null);
		}
	};

	const handleMarkAbsent = async (entryId: number) => {
		try {
			setMarkingAbsentId(entryId);
			setActionError("");

			const token = localStorage.getItem("token");

			const response = await fetch(
				`http://localhost:3000/sign-on/${entryId}/absent`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to mark driver absent");
			}

			await fetchSignOnSheet();
		} catch (error) {
			console.error("Error marking driver absent:", error);

			const message =
				error instanceof Error ? error.message : "Failed to mark driver absent";

			setActionError(message);

			try {
				await fetchSignOnSheet();
			} catch (refreshError) {
				console.error("Error refreshing sign-on sheet:", refreshError);
			}
		} finally {
			setMarkingAbsentId(null);
		}
	};

	if (loading) {
		return <div className={styles.message}>Loading Sign-On Sheet...</div>;
	}

	if (error) {
		return <div className={styles.error}>{error}</div>;
	}

	return (
		<section className={styles.page}>
			<div className={styles.pageHeader}>
				<div>
					<h1 className={styles.title}>Sign-On Sheet</h1>
					<p className={styles.subtitle}>Operational date: {operationalDate}</p>
				</div>

				<div className={styles.summary}>
					<span className={styles.summaryLabel}>Covered duties</span>
					<strong className={styles.summaryValue}>{entries.length}</strong>
				</div>
			</div>

			{actionError && <div className={styles.actionError}>{actionError}</div>}

			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>Duty</th>
							<th>Route</th>
							<th>Employee No.</th>
							<th>Driver</th>
							<th>Sign On</th>
							<th>Sign Off</th>
							<th>Status</th>
							<th>Action</th>
						</tr>
					</thead>

					<tbody>
						{entries.map((entry) => {
							const canSignOn =
								entry.status === "EXPECTED" || entry.status === "DUE";

							const isSigningOn = signingOnId === entry.id;
							const isMarkingAbsent = markingAbsentId === entry.id;

							return (
								<tr key={entry.id}>
									<td className={styles.dutyNumber}>{entry.duty_number}</td>
									<td>{entry.route}</td>
									<td>{entry.driver_number}</td>
									<td>
										{entry.first_name} {entry.last_name}
									</td>
									<td>{entry.sign_on}</td>
									<td>{entry.sign_off}</td>

									<td>
										<span
											className={`${styles.status} ${
												styles[entry.status.toLowerCase()]
											}`}>
											{entry.status.replace("_", " ")}
										</span>
									</td>

									<td>
										{canSignOn ? (
											<button
												type='button'
												className={styles.signOnButton}
												disabled={isSigningOn}
												onClick={() => handleSignOn(entry.id)}>
												{isSigningOn ? "SIGNING ON..." : "SIGN ON"}
											</button>
										) : entry.status === "LATE" ? (
											<button
												type='button'
												className={styles.absentButton}
												disabled={isMarkingAbsent}
												onClick={() => handleMarkAbsent(entry.id)}>
												{isMarkingAbsent ? "MARKING..." : "MARK ABSENT"}
											</button>
										) : (
											<span className={styles.noAction}>—</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default SignOnPage;
