import { useCallback, useEffect, useState } from "react";

import styles from "./OperationsPage.module.css";

import { apiFetch } from "../../config/apiClient";

type ReplacementCandidate = {
	employeeNumber: number;
	batchNumber: number;
	firstName: string;
	lastName: string;
	rotaWeek: number;
};

type ReplacementDriver = {
	employeeNumber: number;
	batchNumber: number;
	firstName: string;
	lastName: string;
};

type OperationalIssue = {
	employeeNumber: number;
	firstName: string;
	lastName: string;
	status: string;
	route: string;
	rota: string;
	rotaWeek: number;
	dutyNumber: number;
	assignmentDate: string;
	coverageStatus: "UNCOVERED" | "COVERED";
	replacementDriver: ReplacementDriver | null;
	replacementCandidates: ReplacementCandidate[];
};

type AiRecommendation = {
	employeeNumber: number;
	reason: string;
};

const getTodayDate = () => {
	const today = new Date();

	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const OperationsPage = () => {
	const [issues, setIssues] = useState<OperationalIssue[]>([]);
	const [selectedDate, setSelectedDate] = useState(getTodayDate);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [assigningDriver, setAssigningDriver] = useState<number | null>(null);
	const [aiLoadingIssue, setAiLoadingIssue] = useState<number | null>(null);
	const [aiRecommendations, setAiRecommendations] = useState<
		Record<number, AiRecommendation>
	>({});

	const loadIssues = useCallback(async () => {
		try {
			setLoading(true);

			const token = localStorage.getItem("token");

			const response = await apiFetch(
				`/operations/issues?date=${selectedDate}`,
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
			setAiRecommendations({});
			setError("");
		} catch (error) {
			console.error("Error loading operational issues:", error);
			setError("Unable to load operational issues.");
		} finally {
			setLoading(false);
		}
	}, [selectedDate]);

	useEffect(() => {
		loadIssues();
	}, [loadIssues]);

	const handleAiRecommendation = async (issue: OperationalIssue) => {
		try {
			setAiLoadingIssue(issue.employeeNumber);
			setError("");

			const token = localStorage.getItem("token");

			const response = await apiFetch("/operations/ai-recommendation", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					employeeNumber: issue.employeeNumber,
					dutyNumber: issue.dutyNumber,
					assignmentDate: issue.assignmentDate,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate AI recommendation");
			}

			setAiRecommendations((current) => ({
				...current,
				[issue.employeeNumber]: data.recommendation,
			}));
		} catch (error) {
			console.error("Error generating AI recommendation:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to generate AI recommendation.",
			);
		} finally {
			setAiLoadingIssue(null);
		}
	};

	const handleAssign = async (
		issue: OperationalIssue,
		candidate: ReplacementCandidate,
	) => {
		try {
			setAssigningDriver(candidate.employeeNumber);
			setError("");

			const token = localStorage.getItem("token");

			const response = await apiFetch("/operations/assignments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					absentDriverNumber: issue.employeeNumber,
					replacementDriverNumber: candidate.employeeNumber,
					dutyNumber: issue.dutyNumber,
					assignmentDate: issue.assignmentDate,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to assign replacement");
			}

			setAiRecommendations((current) => {
				const next = { ...current };

				delete next[issue.employeeNumber];

				return next;
			});

			await loadIssues();
		} catch (error) {
			console.error("Error assigning replacement:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to assign replacement driver.",
			);
		} finally {
			setAssigningDriver(null);
		}
	};

	const activeIssues = issues.filter(
		(issue) => issue.coverageStatus === "UNCOVERED",
	).length;

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<div>
					<h1>Operations Board</h1>
					<p>Driver availability issues and replacement options.</p>
				</div>

				<div className={styles.headerControls}>
					<label className={styles.dateControl}>
						<span>Operational date</span>

						<input
							type='date'
							value={selectedDate}
							onChange={(event) => setSelectedDate(event.target.value)}
						/>
					</label>

					<div className={styles.issueCount}>{activeIssues} active issues</div>
				</div>
			</div>

			{error && <p className={styles.error}>{error}</p>}

			{loading ? (
				<p className={styles.loading}>Loading operational issues...</p>
			) : (
				<div className={styles.grid}>
					{issues.map((issue) => {
						const aiRecommendation = aiRecommendations[issue.employeeNumber];

						const recommendedCandidate = issue.replacementCandidates.find(
							(candidate) =>
								candidate.employeeNumber === aiRecommendation?.employeeNumber,
						);

						return (
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

									<div>
										<span>Duty</span>
										<strong>{issue.dutyNumber}</strong>
									</div>

									<div>
										<span>Date</span>
										<strong>{issue.assignmentDate}</strong>
									</div>
								</div>

								<div className={styles.replacements}>
									{issue.coverageStatus === "COVERED" &&
									issue.replacementDriver ? (
										<>
											<h3 className={styles.coveredStatus}>COVERED</h3>

											<div className={styles.candidate}>
												<div>
													<strong>
														{issue.replacementDriver.firstName}{" "}
														{issue.replacementDriver.lastName}
													</strong>

													<span>#{issue.replacementDriver.employeeNumber}</span>
												</div>
											</div>
										</>
									) : (
										<>
											<h3 className={styles.uncoveredStatus}>UNCOVERED</h3>

											<h3>Replacement candidates</h3>

											{issue.replacementCandidates.length === 0 ? (
												<p className={styles.noReplacement}>
													No available spare driver
												</p>
											) : (
												<>
													<button
														className={styles.assignButton}
														type='button'
														disabled={aiLoadingIssue === issue.employeeNumber}
														onClick={() => handleAiRecommendation(issue)}>
														{aiLoadingIssue === issue.employeeNumber
															? "AI analysing..."
															: "AI Recommendation"}
													</button>

													{aiRecommendation && recommendedCandidate && (
														<div className={styles.candidate}>
															<div>
																<strong>
																	AI recommends:{" "}
																	{recommendedCandidate.firstName}{" "}
																	{recommendedCandidate.lastName}
																</strong>

																<span>
																	#{recommendedCandidate.employeeNumber}
																</span>

																<span>{aiRecommendation.reason}</span>
															</div>
														</div>
													)}

													{issue.replacementCandidates.map((candidate) => (
														<div
															className={styles.candidate}
															key={candidate.employeeNumber}>
															<div>
																<strong>
																	{candidate.firstName} {candidate.lastName}
																</strong>

																<span>#{candidate.employeeNumber}</span>
															</div>

															<button
																className={styles.assignButton}
																type='button'
																disabled={
																	assigningDriver === candidate.employeeNumber
																}
																onClick={() => handleAssign(issue, candidate)}>
																{assigningDriver === candidate.employeeNumber
																	? "Assigning..."
																	: "Assign"}
															</button>
														</div>
													))}
												</>
											)}
										</>
									)}
								</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
};

export default OperationsPage;
