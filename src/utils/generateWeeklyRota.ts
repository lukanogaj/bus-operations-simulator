import { generateRouteAllocation } from "./generateRouteAllocation";
import { getCurrentRotaWeek } from "./getCurrentRotaWeek";
import { getWeeklyRestPattern } from "./getWeeklyRestPattern";
import type { Driver } from "../types/driver";

type LineRoute = Exclude<Driver["route"], "spare">;
type LineRota = "early" | "middle" | "late";

export const generateWeeklyRota = (
	route: LineRoute,
	startDate: Date,
	currentDate: Date,
) => {
	const allocation = generateRouteAllocation(route);

	const applyRolling = (rows: typeof allocation.early, rota: LineRota) => {
		return rows.map((row) => {
			const currentRotaWeek = getCurrentRotaWeek(
				row.rotaWeek,
				startDate,
				currentDate,
			);

			const weeklyPattern = getWeeklyRestPattern(route, rota, currentRotaWeek);

			return {
				...row,
				rotaWeek: currentRotaWeek,

				saturday: weeklyPattern.saturday,
				sunday: weeklyPattern.sunday,
				monday: weeklyPattern.monday,
				tuesday: weeklyPattern.tuesday,
				wednesday: weeklyPattern.wednesday,
				thursday: weeklyPattern.thursday,
				friday: weeklyPattern.friday,
			};
		});
	};

	return {
		early: applyRolling(allocation.early, "early"),
		middle: applyRolling(allocation.middle, "middle"),
		late: applyRolling(allocation.late, "late"),
	};
};
