import styles from "./DriverRota.module.css";
import type { Driver } from "../types/driver";
import { driverRotaLabels } from "../constants/driverRota";

type DriverRotaType = Driver["rota"];
type DriverRotaProps = {
	rota: DriverRotaType;
};
const DriverRota = ({ rota }: DriverRotaProps) => {
	return (
		<div className={styles.driverRota}>
			{" "}
			<strong>Rota: </strong>
			{driverRotaLabels[rota]}
		</div>
	);
};

export default DriverRota;
