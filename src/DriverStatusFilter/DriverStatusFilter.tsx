import { driverStatusConfig } from "../constants/driverStatus";
import type { Driver } from "../types/driver";
import styles from "./DriverStatusFilter.module.css";

type DriverStatusType = Driver["status"];
type DriverStatusProps = {
	status: DriverStatusType;
};
const DriverStatusFilter = ({ status }: DriverStatusProps) => {
	return (
		<div className={styles.dropdownContainer}>
			<strong>Status: </strong>
			{driverStatusConfig[status].label}

			<select
				name='status'
				id=''>
				<option value=''>All Statuses</option>
				{Object.entries(driverStatusConfig).map(([key, value]) => (
					<option
						value={key}
						key={key}>
						{value.label}
					</option>
				))}
			</select>
		</div>
	);
};

export default DriverStatusFilter;
