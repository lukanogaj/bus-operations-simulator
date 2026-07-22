import styles from "./DriverCard.module.css";
import type { Driver } from "../../types/driver";
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
			Last Name: {lastName},First Name: {firstName}, Employee Number:
			{employeeNumber},Batch Number:{batchNumber}, Status:{status}, Rota:{rota},
			Route:{route}
		</li>
	);
};

export default DriverCard;
