import { useCallback, useEffect, useState, type SyntheticEvent } from "react";

import styles from "./PlannedAbsencesPage.module.css";

import { apiFetch } from "../../config/apiClient";

type Driver = {
	employeeNumber: number;
	firstName: string;
	lastName: string;
	route: string;
};

type PlannedAbsence = {
	id: number;
	driverNumber: number;
	absenceType: "HOLIDAY" | "TRAINING";
	startDate: string;
	endDate: string;
	notes: string | null;
	createdAt: string;
};

const PlannedAbsencesPage = () => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [absences, setAbsences] = useState<PlannedAbsence[]>([]);
	const [driverNumber, setDriverNumber] = useState("");
	const [absenceType, setAbsenceType] = useState<"HOLIDAY" | "TRAINING">(
		"HOLIDAY",
	);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const loadData = useCallback(async () => {
		try {
			setLoading(true);

			const token = localStorage.getItem("token");

			const [driversResponse, absencesResponse] = await Promise.all([
				apiFetch("/drivers", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}),
				apiFetch("/planned-absences", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}),
			]);

			if (!driversResponse.ok || !absencesResponse.ok) {
				throw new Error("Failed to load planned absence data");
			}

			const driversData: Driver[] = await driversResponse.json();
			const absencesData: PlannedAbsence[] = await absencesResponse.json();

			setDrivers(driversData);
			setAbsences(absencesData);
			setError("");
		} catch (error) {
			console.error("Error loading planned absences:", error);
			setError("Unable to load planned absences.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();

		try {
			setSaving(true);
			setError("");

			const token = localStorage.getItem("token");

			const response = await apiFetch("/planned-absences", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					driverNumber: Number(driverNumber),
					absenceType,
					startDate,
					endDate,
					notes,
				}),
			});

			if (!response.ok) {
				const text = await response.text();

				let message = "Failed to create planned absence";

				if (text) {
					try {
						const data = JSON.parse(text);
						message = data.error || message;
					} catch {
						message = text;
					}
				}

				throw new Error(message);
			}

			setDriverNumber("");
			setAbsenceType("HOLIDAY");
			setStartDate("");
			setEndDate("");
			setNotes("");

			await loadData();
		} catch (error) {
			console.error("Error creating planned absence:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to create planned absence.",
			);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (absenceId: number) => {
		try {
			setError("");

			const token = localStorage.getItem("token");

			const response = await apiFetch(`/planned-absences/${absenceId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const text = await response.text();

				let message = "Failed to delete planned absence";

				if (text) {
					try {
						const data = JSON.parse(text);
						message = data.error || message;
					} catch {
						message = text;
					}
				}

				throw new Error(message);
			}

			await loadData();
		} catch (error) {
			console.error("Error deleting planned absence:", error);

			setError(
				error instanceof Error
					? error.message
					: "Unable to delete planned absence.",
			);
		}
	};

	const getDriverName = (employeeNumber: number) => {
		const driver = drivers.find(
			(item) => item.employeeNumber === employeeNumber,
		);

		return driver
			? `${driver.firstName} ${driver.lastName}`
			: `Driver #${employeeNumber}`;
	};

	return (
		<section className={styles.container}>
			<div className={styles.header}>
				<h1>Planned Absences</h1>
				<p>Plan driver holidays and training in advance.</p>
			</div>

			{error && <p className={styles.error}>{error}</p>}

			<form
				className={styles.form}
				onSubmit={handleSubmit}>
				<label>
					<span>Driver</span>

					<select
						value={driverNumber}
						onChange={(event) => setDriverNumber(event.target.value)}
						required>
						<option value=''>Select driver</option>

						{drivers
							.filter((driver) => driver.route !== "spare")
							.map((driver) => (
								<option
									key={driver.employeeNumber}
									value={driver.employeeNumber}>
									{driver.firstName} {driver.lastName} #{driver.employeeNumber}
								</option>
							))}
					</select>
				</label>

				<label>
					<span>Type</span>

					<select
						value={absenceType}
						onChange={(event) =>
							setAbsenceType(event.target.value as "HOLIDAY" | "TRAINING")
						}>
						<option value='HOLIDAY'>Holiday</option>
						<option value='TRAINING'>Training</option>
					</select>
				</label>

				<label>
					<span>From</span>

					<input
						type='date'
						value={startDate}
						onChange={(event) => setStartDate(event.target.value)}
						required
					/>
				</label>

				<label>
					<span>To</span>

					<input
						type='date'
						value={endDate}
						min={startDate}
						onChange={(event) => setEndDate(event.target.value)}
						required
					/>
				</label>

				<label className={styles.notesField}>
					<span>Notes</span>

					<input
						type='text'
						value={notes}
						placeholder='Optional'
						onChange={(event) => setNotes(event.target.value)}
					/>
				</label>

				<button
					className={styles.addButton}
					type='submit'
					disabled={saving}>
					{saving ? "Adding..." : "Add absence"}
				</button>
			</form>

			{loading ? (
				<p className={styles.empty}>Loading planned absences...</p>
			) : absences.length === 0 ? (
				<p className={styles.empty}>No planned absences.</p>
			) : (
				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th>Driver</th>
								<th>Employee No.</th>
								<th>Type</th>
								<th>From</th>
								<th>To</th>
								<th>Notes</th>
								<th></th>
							</tr>
						</thead>

						<tbody>
							{absences.map((absence) => (
								<tr key={absence.id}>
									<td>{getDriverName(absence.driverNumber)}</td>

									<td>#{absence.driverNumber}</td>

									<td>
										<span className={styles.typeBadge}>
											{absence.absenceType}
										</span>
									</td>

									<td>{absence.startDate}</td>
									<td>{absence.endDate}</td>

									<td>{absence.notes || "—"}</td>

									<td>
										<button
											className={styles.deleteButton}
											type='button'
											onClick={() => handleDelete(absence.id)}>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
};

export default PlannedAbsencesPage;
