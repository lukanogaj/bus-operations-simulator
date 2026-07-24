import styles from "./DriverStatus.module.css";
import type { Driver } from "../types/driver";
import { driverStatusConfig } from "../constants/driverStatus";

type DriverStatusType = Driver["status"];

type DriverStatusProps = {
	status: DriverStatusType;
};

const DriverStatus = ({ status }: DriverStatusProps) => {
	const statusConfig = driverStatusConfig[status];

	return (
		<div className={styles.driverStatus}>
			<strong>Status:</strong>

			<span
				className={`${styles.statusDot} ${styles[statusConfig.className]}`}></span>

			<span>{statusConfig.label}</span>
		</div>
	);
};

export default DriverStatus;
