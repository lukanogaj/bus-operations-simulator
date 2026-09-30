import { useEffect, useState } from "react";

import styles from "./OperationsPage.module.css";

type ReplacementCandidate = {
	employeeNumber: number;
	batchNumber: number;
	firstName: string;
	lastName: string;
	rotaWeek: number;
};

type OperationalIssue = {
	employeeNumber: number;
	firstName: string;
	lastName: string;
	status: string;
	route: string;
	rota: string;
	rotaWeek: number;
	replacementCandidates: ReplacementCandidate[];
};

const OperationsPage = () => {
	const [issues, setIssues] = useState<OperationalIssue[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const loadIssues = async () => {
			try {
				const token = localStorage.getItem("token");

				const response = await fetch(
					"http://localhost:3000/operations/issues",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				if (!response.ok) {
					throw new Error("Failed to fetch operational issues");
				}

				const data: OperationalIssue[] = await response.json();

				setIssues(data);
			} catch (error) {
				console.error("Error loading operational issues:", error);
				setError("Unable to load operational issues.");
			} finally {
				setLoading(false);
			}
		};

		loadIssues();
	}, []);

	if (loading) {
		return (
			<section className={styles.container}>
				<h1>Operations Board</h1>
				<p>Loading operational issues...</p>
			</section>
		);
	}

	if (error) {
		return (
			<section className={styles.container}>
				<h1>Operations Board</h1>
				<p>{error}</p>
			</section>
		);
	}

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<h1>Operations Board</h1>
					<p>Current driver availability issues and replacement options.</p>
				</div>

				<div className={styles.issueCount}>{issues.length} active issues</div>
			</div>

			<div className={styles.grid}>
				{issues.map((issue) => (
					<article
						className={styles.issueCard}
						key={issue.employeeNumber}>
						<div className={styles.issueHeader}>
							<div>
								<h2>
									{issue.firstName} {issue.lastName}
								</h2>

								<span className={styles.employeeNumber}>
									#{issue.employeeNumber}
								</span>
							</div>

							<span className={styles.status}>{issue.status}</span>
						</div>

						<div className={styles.details}>
							<div>
								<span>Route</span>
								<strong>{issue.route}</strong>
							</div>

							<div>
								<span>Rota</span>
								<strong>{issue.rota}</strong>
							</div>

							<div>
								<span>Rota Week</span>
								<strong>{issue.rotaWeek}</strong>
							</div>
						</div>

						<div className={styles.replacements}>
							<h3>Replacement candidates</h3>

							{issue.replacementCandidates.length === 0 ? (
								<p className={styles.noReplacement}>
									No available spare driver
								</p>
							) : (
								issue.replacementCandidates.map((candidate) => (
									<div
										className={styles.candidate}
										key={candidate.employeeNumber}>
										<div>
											<strong>
												{candidate.firstName} {candidate.lastName}
											</strong>

											<span>#{candidate.employeeNumber}</span>
										</div>

										<span>Week {candidate.rotaWeek}</span>
									</div>
								))
							)}
						</div>
					</article>
				))}
			</div>
		</section>
	);
};

export default OperationsPage;
