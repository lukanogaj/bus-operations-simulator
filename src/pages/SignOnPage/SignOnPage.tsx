import { useEffect, useState } from "react";

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

const TEST_OPERATIONAL_DATE = "2026-10-03";

const SignOnPage = () => {
	const [entries, setEntries] = useState<SignOnEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchSignOnSheet = async () => {
			try {
				setLoading(true);
				setError("");

				const token = localStorage.getItem("token");

				const response = await fetch(
					`http://localhost:3000/sign-on/${TEST_OPERATIONAL_DATE}`,
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
			} catch (error) {
				console.error("Error fetching sign-on sheet:", error);
				setError("Unable to load Sign-On Sheet.");
			} finally {
				setLoading(false);
			}
		};

		fetchSignOnSheet();
	}, []);

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
					<p className={styles.subtitle}>
						Operational date: {TEST_OPERATIONAL_DATE}
					</p>
				</div>

				<div className={styles.summary}>
					<span className={styles.summaryLabel}>Covered duties</span>
					<strong className={styles.summaryValue}>{entries.length}</strong>
				</div>
			</div>

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
						</tr>
					</thead>

					<tbody>
						{entries.map((entry) => (
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
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default SignOnPage;
