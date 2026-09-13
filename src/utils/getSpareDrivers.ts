import { driverList } from "../data/drivers";

export const getSpareDrivers = () => {
	return driverList.filter(
		(driver) => driver.route === "spare" && driver.rota === "spare",
	);
};
