import styles from "./DriversPage.module.css";
import { driverList } from "../../data/drivers";
import DriverCard from "../../components/DriverCard/DriverCard";

const DriverPage = () => {
	return (
		<section className={styles.container}>
			<h1>Drivers</h1>
			<ul className={styles.driverList}>
				{driverList.map((item) => (
					<DriverCard
						lastName={item.lastName}
						firstName={item.firstName}
						employeeNumber={item.employeeNumber}
						batchNumber={item.batchNumber}
						status={item.status}
						rota={item.rota}
						route={item.route}
						key={item.employeeNumber}
					/>
				))}
			</ul>
		</section>
	);
};

export default DriverPage;
