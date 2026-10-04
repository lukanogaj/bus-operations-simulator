import { useState } from "react";

import { apiFetch } from "../../config/apiClient";
import styles from "./ReportsPage.module.css";

type ReportSummary = {
	signOn: {
		total: number;
		signedOn: number;
		late: number;
		absent: number;
		expected: number;
		due: number;
	};
	incidents: {
		total: number;
		open: number;
		resolved: number;
	};
	replacements: {
		total: number;
	};
};

type SignOnHistoryItem = {
	id: number;
	operationalDate: string;
	driverNumber: number;
	firstName: string;
	lastName: string;
	dutyNumber: number;
	route: string;
	signOn: string;
	signOff: string;
	signedOnAt: string | null;
	status: string;
};

type IncidentHistoryItem = {
	id: number;
	incidentType: string;
	description: string;
	status: string;
	route: string | null;
	driverNumber: number | null;
	createdAt: string;
	resolvedAt: string | null;
};

type ReplacementHistoryItem = {
	id: number;
	assignmentDate: string;
	absentDriverNumber: number;
	absentFirstName: string;
	absentLastName: string;
	replacementDriverNumber: number;
	replacementFirstName: string;
	replacementLastName: string;
	dutyNumber: number;
	route: string;
	createdAt: string;
};

type ReportData = {
	range: {
		from: string;
		to: string;
	};
	summary: ReportSummary;
	signOnHistory: SignOnHistoryItem[];
	incidentHistory: IncidentHistoryItem[];
	replacementHistory: ReplacementHistoryItem[];
};

const formatDateInput = (date: Date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const getDefaultFromDate = () => {
	const date = new Date();
	date.setDate(date.getDate() - 7);

	return formatDateInput(date);
};

const getDefaultToDate = () => {
	return formatDateInput(new Date());
};

const ReportsPage = () => {
	const [from, setFrom] = useState(getDefaultFromDate);
	const [to, setTo] = useState(getDefaultToDate);
	const [report, setReport] = useState<ReportData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const loadReport = async (fromDate: string, toDate: string) => {
		const token = localStorage.getItem("token");

		if (!token) {
			setError("Authentication token is missing.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await apiFetch(
				`/reports?from=${encodeURIComponent(fromDate)}&to=${encodeURIComponent(toDate)}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error ?? "Failed to load report");
			}

			setReport(data);
		} catch (requestError) {
			setReport(null);
			setError(
				requestError instanceof Error
					? requestError.message
					: "Failed to load report",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleGenerateReport = () => {
		if (!from || !to) {
			setError("Select both report dates.");
			return;
		}

		if (from > to) {
			setError("From date cannot be after to date.");
			return;
		}

		void loadReport(from, to);
	};

	return (
		<section className={styles.page}>
			<div className={styles.header}>
				<div>
					<h1>Reports</h1>
					<p>Historical operational performance and activity.</p>
				</div>
			</div>

			<div className={styles.filters}>
				<label className={styles.dateField}>
					<span>From</span>
					<input
						type='date'
						value={from}
						onChange={(event) => setFrom(event.target.value)}
					/>
				</label>

				<label className={styles.dateField}>
					<span>To</span>
					<input
						type='date'
						value={to}
						onChange={(event) => setTo(event.target.value)}
					/>
				</label>

				<button
					type='button'
					className={styles.generateButton}
					onClick={handleGenerateReport}
					disabled={loading}>
					{loading ? "Loading..." : "Generate report"}
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			{report && (
				<>
					<div className={styles.summaryGrid}>
						<div className={styles.summaryCard}>
							<span className={styles.summaryLabel}>Sign-On Entries</span>
							<strong>{report.summary.signOn.total}</strong>

							<div className={styles.summaryDetails}>
								<span>Signed on: {report.summary.signOn.signedOn}</span>
								<span>Late: {report.summary.signOn.late}</span>
								<span>Absent: {report.summary.signOn.absent}</span>
								<span>Expected: {report.summary.signOn.expected}</span>
								<span>Due: {report.summary.signOn.due}</span>
							</div>
						</div>

						<div className={styles.summaryCard}>
							<span className={styles.summaryLabel}>Incidents</span>
							<strong>{report.summary.incidents.total}</strong>

							<div className={styles.summaryDetails}>
								<span>Open: {report.summary.incidents.open}</span>
								<span>Resolved: {report.summary.incidents.resolved}</span>
							</div>
						</div>

						<div className={styles.summaryCard}>
							<span className={styles.summaryLabel}>Replacements</span>
							<strong>{report.summary.replacements.total}</strong>

							<div className={styles.summaryDetails}>
								<span>Assignments in selected period</span>
							</div>
						</div>
					</div>

					<div className={styles.reportSection}>
						<div className={styles.sectionHeader}>
							<h2>Sign-On History</h2>
							<span>{report.signOnHistory.length} entries</span>
						</div>

						<div className={styles.tableWrapper}>
							<table>
								<thead>
									<tr>
										<th>Date</th>
										<th>Driver</th>
										<th>Duty</th>
										<th>Route</th>
										<th>Sign-On</th>
										<th>Status</th>
									</tr>
								</thead>

								<tbody>
									{report.signOnHistory.length === 0 ? (
										<tr>
											<td
												colSpan={6}
												className={styles.emptyRow}>
												No sign-on entries in this period.
											</td>
										</tr>
									) : (
										report.signOnHistory.map((entry) => (
											<tr key={entry.id}>
												<td>{entry.operationalDate}</td>
												<td>
													{entry.driverNumber} — {entry.firstName}{" "}
													{entry.lastName}
												</td>
												<td>{entry.dutyNumber}</td>
												<td>{entry.route}</td>
												<td>{entry.signOn}</td>
												<td>
													<span
														className={`${styles.status} ${
															styles[
																`status${entry.status
																	.toLowerCase()
																	.replace("_", "")}`
															] ?? ""
														}`}>
														{entry.status.replace("_", " ")}
													</span>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					<div className={styles.reportSection}>
						<div className={styles.sectionHeader}>
							<h2>Replacement History</h2>
							<span>{report.replacementHistory.length} assignments</span>
						</div>

						<div className={styles.tableWrapper}>
							<table>
								<thead>
									<tr>
										<th>Date</th>
										<th>Absent Driver</th>
										<th>Replacement Driver</th>
										<th>Duty</th>
										<th>Route</th>
									</tr>
								</thead>

								<tbody>
									{report.replacementHistory.length === 0 ? (
										<tr>
											<td
												colSpan={5}
												className={styles.emptyRow}>
												No replacement assignments in this period.
											</td>
										</tr>
									) : (
										report.replacementHistory.map((assignment) => (
											<tr key={assignment.id}>
												<td>{assignment.assignmentDate}</td>
												<td>
													{assignment.absentDriverNumber} —{" "}
													{assignment.absentFirstName}{" "}
													{assignment.absentLastName}
												</td>
												<td>
													{assignment.replacementDriverNumber} —{" "}
													{assignment.replacementFirstName}{" "}
													{assignment.replacementLastName}
												</td>
												<td>{assignment.dutyNumber}</td>
												<td>{assignment.route}</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>

					<div className={styles.reportSection}>
						<div className={styles.sectionHeader}>
							<h2>Incident History</h2>
							<span>{report.incidentHistory.length} incidents</span>
						</div>

						<div className={styles.tableWrapper}>
							<table>
								<thead>
									<tr>
										<th>Created</th>
										<th>Type</th>
										<th>Description</th>
										<th>Route</th>
										<th>Driver</th>
										<th>Status</th>
									</tr>
								</thead>

								<tbody>
									{report.incidentHistory.length === 0 ? (
										<tr>
											<td
												colSpan={6}
												className={styles.emptyRow}>
												No incidents in this period.
											</td>
										</tr>
									) : (
										report.incidentHistory.map((incident) => (
											<tr key={incident.id}>
												<td>{new Date(incident.createdAt).toLocaleString()}</td>
												<td>{incident.incidentType}</td>
												<td>{incident.description}</td>
												<td>{incident.route ?? "—"}</td>
												<td>{incident.driverNumber ?? "—"}</td>
												<td>
													<span className={styles.status}>
														{incident.status}
													</span>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
		</section>
	);
};

export default ReportsPage;
