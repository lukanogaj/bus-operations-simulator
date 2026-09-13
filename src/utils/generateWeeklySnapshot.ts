import { generateFullWeeklyRota } from "./generateFullWeeklyRota";

export const generateWeeklySnapshot = (startDate: Date, currentDate: Date) => {
	const weekStart = new Date(currentDate);

	const daysSinceSaturday = (weekStart.getDay() + 1) % 7;

	weekStart.setDate(weekStart.getDate() - daysSinceSaturday);

	const year = weekStart.getFullYear();
	const month = String(weekStart.getMonth() + 1).padStart(2, "0");
	const day = String(weekStart.getDate()).padStart(2, "0");

	const weekCommencing = `${year}-${month}-${day}`;

	return {
		weekCommencing,
		generatedAt: new Date().toISOString(),
		rota: generateFullWeeklyRota(startDate, currentDate),
	};
};
