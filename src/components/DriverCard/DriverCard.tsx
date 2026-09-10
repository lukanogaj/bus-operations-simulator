import styles from "./DriverCard.module.css";
import type { Driver } from "../../types/driver";
import DriverStatus from "../../DriverStatus/DriverStatus";
import DriverRota from "../../DriverRota/DriverRota";
import DriverRoute from "../../DriverRoute/DriverRoute";
import DriverRotaWeek from "../../DriverRotaWeek/DriverRotaWeek";
const DriverCard = ({
	employeeNumber,
	batchNumber,
	firstName,
	lastName,
	status,
	rota,
	route,
	rotaWeek,
}: Driver) => {
	return (
		<li className={styles.driverCard}>
			<h3 className={styles.driverName}>
				{firstName} {lastName}
			</h3>
			<p>
				<strong>Employee Number: </strong>
				{employeeNumber}
			</p>
			<p>
				<strong>Batch Number:</strong> {batchNumber}
			</p>
			<DriverStatus status={status} />
			<DriverRota rota={rota} />
			<DriverRoute route={route} />
			<DriverRotaWeek rotaWeek={rotaWeek} />
		</li>
	);
};

export default DriverCard;
