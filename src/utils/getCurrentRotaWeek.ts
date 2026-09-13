import type { Driver } from "../types/driver";

export const getCurrentRotaWeek = (
	baseRotaWeek: Driver["rotaWeek"],
	startDate: Date,
	currentDate: Date,
): Driver["rotaWeek"] => {
	const startUtc = Date.UTC(
		startDate.getFullYear(),
		startDate.getMonth(),
		startDate.getDate(),
	);

	const currentUtc = Date.UTC(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		currentDate.getDate(),
	);

	const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;

	const elapsedWeeks = Math.floor(
		(currentUtc - startUtc) / millisecondsPerWeek,
	);

	return (((baseRotaWeek - 1 + elapsedWeeks) % 4) + 1) as Driver["rotaWeek"];
};
