import { generateWeeklyRotaPdf } from "../../utils/generateWeeklyRotaPdf";

import styles from "./AllocationPage.module.css";

const AllocationPage = () => {
	const handleViewPdf = async () => {
		try {
			const response = await fetch("http://localhost:3000/weekly-snapshot");

			if (!response.ok) {
				throw new Error("Failed to fetch weekly snapshot");
			}

			const snapshot = await response.json();

			generateWeeklyRotaPdf(snapshot);
		} catch (error) {
			console.error("Error loading weekly rota:", error);
		}
	};

	return (
		<section className={styles.container}>
			<h1>Allocation</h1>

			<div className={styles.rotaCard}>
				<h2>Current Weekly Rota</h2>

				<p>10 Routes • 120 Line Drivers</p>

				<button
					className={styles.viewPdfButton}
					onClick={handleViewPdf}>
					View Weekly Rota PDF
				</button>
			</div>
		</section>
	);
};

export default AllocationPage;
