import { useCallback, useEffect, useState } from "react";

import styles from "./DashboardPage.module.css";

type Driver = {
	employeeNumber: number;
	status: string;
};

type OperationalIssue = {
	employeeNumber: number;
	firstName: string;
	lastName: string;
	dutyNumber: number;
	route: string;
	assignmentDate: string;
	coverageStatus: "UNCOVERED" | "COVERED";
};

type Incident = {
	id: number;
	incidentType: string;
	description: string;
	status: "open" | "resolved";
	route: string | null;
};

type SignOnEntry = {
	id: number;
	dutyNumber: number;
	status: "EXPECTED" | "DUE" | "SIGNED_ON" | "LATE" | "ABSENT";
};

const getLondonDate = () =>
	new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/London",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());

const DashboardPage = () => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [issues, setIssues] = useState<OperationalIssue[]>([]);
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [signOnEntries, setSignOnEntries] = useState<SignOnEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const loadDashboard = useCallback(async () => {
		try {
			setLoading(true);
			setError("");

			const token = localStorage.getItem("token");
			const operationalDate = getLondonDate();

			const headers = {
				Authorization: `Bearer ${token}`,
			};

			const [
				driversResponse,
				issuesResponse,
				incidentsResponse,
				signOnResponse,
			] = await Promise.all([
				fetch("http://localhost:3000/drivers", { headers }),
				fetch("http://localhost:3000/operations/issues", { headers }),
				fetch("http://localhost:3000/incidents", { headers }),
				fetch(`http://localhost:3000/sign-on/${operationalDate}`, {
					headers,
				}),
			]);

			if (
				!driversResponse.ok ||
				!issuesResponse.ok ||
				!incidentsResponse.ok ||
				!signOnResponse.ok
			) {
				throw new Error("Failed to load dashboard data");
			}

			const [driversData, issuesData, incidentsData, signOnData] =
				await Promise.all([
					driversResponse.json(),
					issuesResponse.json(),
					incidentsResponse.json(),
					signOnResponse.json(),
				]);

			setDrivers(driversData);
			setIssues(issuesData);
			setIncidents(incidentsData);
			setSignOnEntries(signOnData);
		} catch (error) {
			console.error("Error loading dashboard:", error);
			setError("Unable to load dashboard data.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadDashboard();
	}, [loadDashboard]);

	const availableDrivers = drivers.filter(
		(driver) => driver.status.toLowerCase() === "available",
	).length;

	const unavailableDrivers = drivers.length - availableDrivers;

	const signedOn = signOnEntries.filter(
		(entry) => entry.status === "SIGNED_ON",
	).length;

	const expected = signOnEntries.filter(
		(entry) => entry.status === "EXPECTED" || entry.status === "DUE",
	).length;

	const late = signOnEntries.filter((entry) => entry.status === "LATE").length;

	const absent = signOnEntries.filter(
		(entry) => entry.status === "ABSENT",
	).length;

	const uncoveredIssues = issues.filter(
		(issue) => issue.coverageStatus === "UNCOVERED",
	);

	const openIncidents = incidents.filter(
		(incident) => incident.status === "open",
	);

	if (loading) {
		return (
			<section className={styles.page}>
				<h1 className={styles.title}>Dashboard</h1>
				<p className={styles.message}>Loading operational dashboard...</p>
			</section>
		);
	}

	return (
		<section className={styles.page}>
			<div className={styles.pageHeader}>
				<div>
					<h1 className={styles.title}>Dashboard</h1>
					<p className={styles.subtitle}>
						Today's operational overview — {getLondonDate()}
					</p>
				</div>

				<button
					className={styles.refreshButton}
					type='button'
					onClick={loadDashboard}>
					Refresh
				</button>
			</div>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.summaryGrid}>
				<article className={styles.summaryCard}>
					<span>Today's Duties</span>
					<strong>{signOnEntries.length}</strong>
				</article>

				<article className={styles.summaryCard}>
					<span>Available Drivers</span>
					<strong>{availableDrivers}</strong>
					<small>{unavailableDrivers} unavailable</small>
				</article>

				<article className={styles.summaryCard}>
					<span>Open Incidents</span>
					<strong>{openIncidents.length}</strong>
				</article>

				<article className={styles.summaryCard}>
					<span>Uncovered Duties</span>
					<strong>{uncoveredIssues.length}</strong>
				</article>
			</div>

			<div className={styles.section}>
				<h2>Sign-On Summary</h2>

				<div className={styles.signOnGrid}>
					<div>
						<span>Signed On</span>
						<strong>{signedOn}</strong>
					</div>

					<div>
						<span>Expected / Due</span>
						<strong>{expected}</strong>
					</div>

					<div>
						<span>Late</span>
						<strong>{late}</strong>
					</div>

					<div>
						<span>Absent</span>
						<strong>{absent}</strong>
					</div>
				</div>
			</div>

			<div className={styles.twoColumnGrid}>
				<div className={styles.section}>
					<div className={styles.sectionHeader}>
						<h2>Operational Issues</h2>
						<span>{uncoveredIssues.length} active</span>
					</div>

					{uncoveredIssues.length === 0 ? (
						<p className={styles.clearMessage}>
							No uncovered operational issues.
						</p>
					) : (
						<div className={styles.alertList}>
							{uncoveredIssues.slice(0, 5).map((issue) => (
								<article
									className={styles.alertCard}
									key={`${issue.employeeNumber}-${issue.dutyNumber}`}>
									<strong>
										Duty {issue.dutyNumber} — Route {issue.route}
									</strong>

									<span>
										{issue.firstName} {issue.lastName} #{issue.employeeNumber}
									</span>
								</article>
							))}
						</div>
					)}
				</div>

				<div className={styles.section}>
					<div className={styles.sectionHeader}>
						<h2>Open Incidents</h2>
						<span>{openIncidents.length} open</span>
					</div>

					{openIncidents.length === 0 ? (
						<p className={styles.clearMessage}>No open incidents.</p>
					) : (
						<div className={styles.alertList}>
							{openIncidents.slice(0, 5).map((incident) => (
								<article
									className={styles.alertCard}
									key={incident.id}>
									<strong>{incident.incidentType}</strong>

									<span>
										{incident.route
											? `Route ${incident.route}`
											: "No route specified"}
									</span>

									<p>{incident.description}</p>
								</article>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default DashboardPage;
