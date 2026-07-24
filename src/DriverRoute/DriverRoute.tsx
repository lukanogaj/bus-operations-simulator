import styles from "./DriverRoute.module.css";
import type { Driver } from "../types/driver";
type DriverRouteType = Driver["route"];
type DriverRouteProps = {
	route: DriverRouteType;
};
const DriverRoute = ({ route }: DriverRouteProps) => {
	return <div className={styles.driverRoute}>Route: {route} </div>;
};

export default DriverRoute;
