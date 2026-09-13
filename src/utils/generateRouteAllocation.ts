import type { Driver } from "../types/driver";
import type { RotaAllocationRow } from "../types/rotaAllocation";
import { getDriversForRota } from "./getDriversForRota";
import { getWeeklyRestPattern } from "./getWeeklyRestPattern";

const rotaWeeks: Driver["rotaWeek"][] = [1, 2, 3, 4];

type LineRota = "early" | "middle" | "late";
type LineRoute = Exclude<Driver["route"], "spare">;

const generateRotaRows = (
	route: LineRoute,
	rota: LineRota,
): RotaAllocationRow[] => {
	return rotaWeeks.flatMap((week) => {
		const drivers = getDriversForRota(route, rota, week);
		const weeklyPattern = getWeeklyRestPattern(route, rota, week);

		return drivers.map((driver) => ({
			route,
			rota,
			employeeNumber: driver.employeeNumber,
			position: week,
			rotaWeek: week,

			saturday: weeklyPattern.saturday,
			sunday: weeklyPattern.sunday,
			monday: weeklyPattern.monday,
			tuesday: weeklyPattern.tuesday,
			wednesday: weeklyPattern.wednesday,
			thursday: weeklyPattern.thursday,
			friday: weeklyPattern.friday,
		}));
	});
};

export const generateRouteAllocation = (route: LineRoute) => {
	return {
		early: generateRotaRows(route, "early"),
		middle: generateRotaRows(route, "middle"),
		late: generateRotaRows(route, "late"),
	};
};
