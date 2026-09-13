import { restDayPattern } from "../data/rotaWeeks";
import type { Driver } from "../types/driver";
import { generateDutyNumber } from "./generateDutyNumber";

export const getWeeklyRestPattern = (
	route: Exclude<Driver["route"], "spare">,
	rota: "early" | "middle" | "late",
	rotaWeek: 1 | 2 | 3 | 4,
) => {
	const pattern = restDayPattern.find(
		(pattern) => pattern.weekNumber === rotaWeek,
	);

	if (!pattern) {
		throw new Error(`Rest day pattern not found for week ${rotaWeek}`);
	}

	let workDayIndex = 0;

	const getDayValue = (day: "R" | "W"): "R" | number => {
		if (day === "R") {
			return "R";
		}

		const dutyNumber = generateDutyNumber(route, rota, rotaWeek, workDayIndex);

		workDayIndex++;

		return dutyNumber;
	};

	return {
		weekNumber: pattern.weekNumber,
		saturday: getDayValue(pattern.saturday),
		sunday: getDayValue(pattern.sunday),
		monday: getDayValue(pattern.monday),
		tuesday: getDayValue(pattern.tuesday),
		wednesday: getDayValue(pattern.wednesday),
		thursday: getDayValue(pattern.thursday),
		friday: getDayValue(pattern.friday),
	};
};
