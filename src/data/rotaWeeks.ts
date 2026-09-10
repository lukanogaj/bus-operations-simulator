import type { RestDayPattern } from "../types/rotaWeek";

export const restDayPattern: RestDayPattern[] = [
	{
		weekNumber: 1,
		saturday: "R",
		sunday: "R",
		monday: "W",
		tuesday: "W",
		wednesday: "W",
		thursday: "W",
		friday: "W",
	},
	{
		weekNumber: 2,
		saturday: "W",
		sunday: "R",
		monday: "R",
		tuesday: "W",
		wednesday: "W",
		thursday: "W",
		friday: "W",
	},
	{
		weekNumber: 3,
		saturday: "W",
		sunday: "W",
		monday: "W",
		tuesday: "R",
		wednesday: "R",
		thursday: "W",
		friday: "W",
	},
	{
		weekNumber: 4,
		saturday: "W",
		sunday: "W",
		monday: "W",
		tuesday: "W",
		wednesday: "W",
		thursday: "R",
		friday: "R",
	},
];
