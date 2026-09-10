import type { Driver } from "../types/driver";
import { driverList } from "../data/drivers.generated";

export const getDriversForRota = (
	rota: Driver["rota"],
	rotaWeek: Driver["rotaWeek"],
): Driver[] => {
	return driverList.filter(
		(driver) => driver.rota === rota && driver.rotaWeek === rotaWeek,
	);
};
