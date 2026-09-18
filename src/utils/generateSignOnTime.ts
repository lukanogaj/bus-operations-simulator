import { dutyTimeRanges } from "../data/dutyTimeRanges";

type DutyRota = keyof typeof dutyTimeRanges;

const timeToMinutes = (time: string): number => {
	const [hours, minutes] = time.split(":").map(Number);

	return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number): string => {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const generateSignOnTime = (
	rota: DutyRota,
	position: number,
	totalDuties: number,
): string => {
	const range = dutyTimeRanges[rota];
	if (totalDuties === 1) {
		return range.signOnStart;
	}

	const startMinutes = timeToMinutes(range.signOnStart);
	const endMinutes = timeToMinutes(range.signOnEnd);

	const interval = (endMinutes - startMinutes) / (totalDuties - 1);

	const signOnMinutes = Math.round(startMinutes + interval * position);

	return minutesToTime(signOnMinutes);
};
