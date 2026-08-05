import type { RestDayPattern } from "../types/rotaDutyPattern";

export const restDaysPatterns: RestDayPattern[] = [
	{
		patternNumber: 1,
		saturday: "R",
		sunday: "R",
		monday: "W",
		tuesday: "W",
		wednesday: "W",
		thursday: "W",
		friday: "W",
	},
	{
		patternNumber: 2,
		saturday: "W",
		sunday: "R",
		monday: "R",
		tuesday: "W",
		wednesday: "W",
		thursday: "W",
		friday: "W",
	},
	{
		patternNumber: 3,
		saturday: "W",
		sunday: "W",
		monday: "W",
		tuesday: "R",
		wednesday: "R",
		thursday: "W",
		friday: "W",
	},
	{
		patternNumber: 4,
		saturday: "W",
		sunday: "W",
		monday: "W",
		tuesday: "W",
		wednesday: "W",
		thursday: "R",
		friday: "R",
	},
];
