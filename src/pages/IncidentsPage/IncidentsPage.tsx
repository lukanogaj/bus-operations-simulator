import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import styles from "./IncidentsPage.module.css";

type IncidentStatus = "open" | "resolved";

type Incident = {
	id: number;
	incidentType: string;
	description: string;
	status: IncidentStatus;
	route: string | null;
	driverNumber: number | null;
	createdAt: string;
	resolvedAt: string | null;
};

const IncidentsPage = () => {
	const [incidents, setIncidents] = useState<Incident[]>([]);
	const [incidentType, setIncidentType] = useState("");
	const [description, setDescription] = useState("");
	const [route, setRoute] = useState("");
	const [driverNumber, setDriverNumber] = useState("");
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	const token = localStorage.getItem("token");

	const fetchIncidents = useCallback(async () => {
		try {
			setError("");

			const response = await fetch("http://localhost:3000/incidents", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to load incidents");
			}

			const data: Incident[] = await response.json();

			setIncidents(data);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to load incidents",
			);
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		fetchIncidents();
	}, [fetchIncidents]);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			setSubmitting(true);
			setError("");

			const response = await fetch("http://localhost:3000/incidents", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					incidentType,
					description,
					route: route || undefined,
					driverNumber: driverNumber ? Number(driverNumber) : undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();

				throw new Error(data.error || "Failed to create incident");
			}

			setIncidentType("");
			setDescription("");
			setRoute("");
			setDriverNumber("");

			await fetchIncidents();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to create incident",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const handleResolve = async (incidentId: number) => {
		try {
			setError("");

			const response = await fetch(
				`http://localhost:3000/incidents/${incidentId}/resolve`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				const data = await response.json();

				throw new Error(data.error || "Failed to resolve incident");
			}

			await fetchIncidents();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to resolve incident",
			);
		}
	};

	return (
		<section className={styles.page}>
			<div className={styles.header}>
				<div>
					<h1>Incidents</h1>
					<p>Record and manage operational incidents.</p>
				</div>
			</div>

			<form
				className={styles.form}
				onSubmit={handleSubmit}>
				<h2>Report Incident</h2>

				<div className={styles.formGrid}>
					<label>
						Incident type
						<input
							type='text'
							value={incidentType}
							onChange={(event) => setIncidentType(event.target.value)}
							placeholder='e.g. Vehicle breakdown'
							required
						/>
					</label>

					<label>
						Route
						<input
							type='text'
							value={route}
							onChange={(event) => setRoute(event.target.value)}
							placeholder='Optional'
						/>
					</label>

					<label>
						Driver number
						<input
							type='number'
							value={driverNumber}
							onChange={(event) => setDriverNumber(event.target.value)}
							placeholder='Optional'
						/>
					</label>
				</div>

				<label className={styles.descriptionField}>
					Description
					<textarea
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder='Describe what happened'
						required
					/>
				</label>

				<button
					type='submit'
					disabled={submitting}>
					{submitting ? "Reporting..." : "Report Incident"}
				</button>
			</form>

			{error && <div className={styles.error}>{error}</div>}

			<div className={styles.incidentSection}>
				<h2>Incident Log</h2>

				{loading ? (
					<p>Loading incidents...</p>
				) : incidents.length === 0 ? (
					<p>No incidents reported.</p>
				) : (
					<div className={styles.incidentList}>
						{incidents.map((incident) => (
							<article
								key={incident.id}
								className={styles.incidentCard}>
								<div className={styles.cardHeader}>
									<div>
										<h3>{incident.incidentType}</h3>
										<span
											className={
												incident.status === "open"
													? styles.open
													: styles.resolved
											}>
											{incident.status.toUpperCase()}
										</span>
									</div>

									<span>#{incident.id}</span>
								</div>

								<p>{incident.description}</p>

								<div className={styles.details}>
									<span>Route: {incident.route ?? "Not specified"}</span>
									<span>
										Driver: {incident.driverNumber ?? "Not specified"}
									</span>
									<span>
										Created: {new Date(incident.createdAt).toLocaleString()}
									</span>
								</div>

								{incident.status === "open" && (
									<button
										type='button'
										onClick={() => handleResolve(incident.id)}>
										Resolve Incident
									</button>
								)}
							</article>
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default IncidentsPage;
