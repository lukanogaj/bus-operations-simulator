import type { Driver } from "../types/driver";

import styles from "./DriverRotaWeek.module.css";

type DriverRotaWeekProps = {
	rotaWeek: Driver["rotaWeek"];
};

const DriverRotaWeek = ({ rotaWeek }: DriverRotaWeekProps) => {
	return (
		<p className={styles.rotaWeek}>
			<strong>Rota Week:</strong> {rotaWeek}
		</p>
	);
};

export default DriverRotaWeek;
