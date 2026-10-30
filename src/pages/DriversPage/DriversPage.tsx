import { useEffect, useState } from "react";

import DriverCard from "../../components/DriverCard/DriverCard";
import DriverStatusFilter from "../../DriverStatusFilter/DriverStatusFilter";
import type { Driver } from "../../types/driver";

import styles from "./DriversPage.module.css";

import { apiFetch } from "../../config/apiClient";
const DriverPage = () => {
	const [drivers, setDrivers] = useState<Driver[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<Driver["status"] | "">(
		"",
	);

	const handleSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchItem = e.target.value.toLowerCase();
		setSearchTerm(searchItem);
	};

	const filterDrivers = (drivers: Driver[]) => {
		return drivers.filter((driver) => {
			const fullName = `${driver.firstName} ${driver.lastName}`;
			const matchSearch = fullName.toLowerCase().includes(searchTerm);
			const matchStatus =
				selectedStatus === "" || driver.status === selectedStatus;
			return matchSearch && matchStatus;
		});
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedStatus(e.target.value as Driver["status"]);
	};

	const matchingDrivers = filterDrivers(drivers);

	useEffect(() => {
		apiFetch("/drivers", {
			headers: {},
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
			<div className={styles.searchTerm}>
				<input
					type='text'
					placeholder='Type to search'
					onChange={handleSearchTerm}
				/>
			</div>
			<DriverStatusFilter
				status={selectedStatus}
				onStatusChange={handleStatusChange}
			/>

			<ul className={styles.driverList}>
				{matchingDrivers.map((item) => (
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
