import { generateWeeklySnapshot } from "../../utils/generateWeeklySnapshot";
import { generateWeeklyRotaPdf } from "../../utils/generateWeeklyRotaPdf";

import styles from "./AllocationPage.module.css";

const AllocationPage = () => {
	const handleViewPdf = () => {
		const startDate = new Date("2026-09-05T00:00:00");
		const currentDate = new Date();

		const snapshot = generateWeeklySnapshot(startDate, currentDate);

		generateWeeklyRotaPdf(snapshot);
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
