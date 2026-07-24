import styles from "./DriverRota.module.css";
import type { Driver } from "../types/driver";

type DriverRotaType = Driver["rota"];
type DriverRotaProps = {
	rota: DriverRotaType;
};
const DriverRota = ({ rota }: DriverRotaProps) => {
	return <div className={styles.driverRota}>Rota: {rota}</div>;
};

export default DriverRota;
