import type { Driver } from "../types/driver";
import { driverList } from "../data/drivers";

export const getDriversForRota = (
	route: Driver["route"],
	rota: Driver["rota"],
	rotaWeek: Driver["rotaWeek"],
): Driver[] => {
	return driverList.filter(
		(driver) =>
			driver.route === route &&
			driver.rota === rota &&
			driver.rotaWeek === rotaWeek,
	);
};
