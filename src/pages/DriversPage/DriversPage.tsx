import { useEffect, useState } from "react";

import DriverCard from "../../components/DriverCard/DriverCard";
import type { Driver } from "../../types/driver";

import styles from "./DriversPage.module.css";

const DriverPage = () => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = localStorage.getItem("token");

		fetch("http://localhost:3000/drivers", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to fetch drivers");
				}

				return response.json();
			})
			.then((data) => {
				setDrivers(data);
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
						key={item.employeeNumber}
						lastName={item.lastName}
						firstName={item.firstName}
						employeeNumber={item.employeeNumber}
						batchNumber={item.batchNumber}
						status={item.status}
						rota={item.rota}
						route={item.route}
						rotaWeek={item.rotaWeek}
					/>
				))}
			</ul>
		</section>
	);
};

export default DriverPage;
