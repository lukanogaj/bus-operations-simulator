import styles from "./DriverCard.module.css";
import type { Driver } from "../../types/driver";
import DriverStatus from "../../DriverStatus/DriverStatus";
import DriverRota from "../../DriverRota/DriverRota";
import DriverRoute from "../../DriverRoute/DriverRoute";
const DriverCard = ({
	employeeNumber,
	batchNumber,
	firstName,
	lastName,
	status,
	rota,
	route,
}: Driver) => {
	return (
		<li className={styles.driverCard}>
			<h3 className={styles.driverName}>
				{firstName} {lastName}
			</h3>
			<p>Employee Number: {employeeNumber}</p>
			<p>Batch Number: {batchNumber}</p>
			<DriverStatus status={status} />
			<DriverRota rota={rota} />
			<DriverRoute route={route} />
		</li>
	);
};

export default DriverCard;
