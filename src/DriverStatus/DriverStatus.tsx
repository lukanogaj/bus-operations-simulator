import styles from "./DriverStatus.module.css";
import type { Driver } from "../types/driver";
type DriverStatusType = Driver["status"];
type DriverStatusProps = {
	status: DriverStatusType;
};

const DriverStatus = ({ status }: DriverStatusProps) => {
	return <div className={styles.driverStatus}>Status: {status}</div>;
};

export default DriverStatus;
