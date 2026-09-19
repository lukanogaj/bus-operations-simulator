import { useState, useEffect } from "react";
import styles from "./DriversPage.module.css";
import type { Driver } from "../../types/driver";
import DriverCard from "../../components/DriverCard/DriverCard";

const DriverPage = () => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetch("http://localhost:3000/drivers")
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to fetch drivers");
				}
				return response.json();
			})
			.then((data) => {
				const mapped = data.map((item: any) => ({
					employeeNumber: item.employee_number,
					batchNumber: item.batch_number,
					firstName: item.first_name,
					lastName: item.last_name,
					status: item.status,
					rota: item.rota,
					rotaWeek: item.rota_week,
					route: item.route,
				}));
				setDrivers(mapped);
				setLoading(false);
			})

			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	if (loading) return <p>Loading drivers...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<section className={styles.container}>
			<h1>Drivers</h1>
			<ul className={styles.driverList}>
				{drivers.map((item) => (
					<DriverCard
						lastName={item.lastName}
						firstName={item.firstName}
						employeeNumber={item.employeeNumber}
						batchNumber={item.batchNumber}
						status={item.status}
						rota={item.rota}
						route={item.route}
						rotaWeek={item.rotaWeek}
						key={item.employeeNumber}
					/>
				))}
			</ul>
		</section>
	);
};

export default DriverPage;
