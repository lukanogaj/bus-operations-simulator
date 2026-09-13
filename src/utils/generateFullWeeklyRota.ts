import { routes } from "../data/routes";
import { generateWeeklyRota } from "./generateWeeklyRota";

export const generateFullWeeklyRota = (startDate: Date, currentDate: Date) => {
	return routes.map((route) => ({
		route,
		allocation: generateWeeklyRota(route, startDate, currentDate),
	}));
};
