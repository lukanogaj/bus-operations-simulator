import { useState, useEffect } from "react";
import styles from "./DutiesPage.module.css";
import type { Duty } from "../../types/duty";

const DutiesPage = () => {
	const [duties, setDuties] = useState<Duty[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("http://localhost:3000/duties")
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to fetch duties");
				}
				return response.json();
			})
			.then((data) => {
				setDuties(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	if (loading) return <p>Loading duties...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<section className={styles.container}>
			{" "}
			<h1>Duties</h1>
			<ul className={styles.dutyList}>
				{duties.map((duty) => (
					<li
						key={duty.dutyNumber}
						className={styles.dutyCard}>
						<p className={styles.dutyNumber}>Duty : {duty.dutyNumber}</p>
						<p>
							<strong>Route:</strong> {duty.route}
						</p>
						<p>
							<strong>Rota:</strong> {duty.rota}
						</p>
						<p>
							<strong>Sign On:</strong> {duty.signOn}
						</p>
						<p>
							<strong>Sign Off:</strong> {duty.signOff}
						</p>
					</li>
				))}
			</ul>
		</section>
	);
};

export default DutiesPage;
