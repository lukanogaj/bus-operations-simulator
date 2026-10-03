import type { Pool } from "pg";

import { generateSignOnSheet } from "./signOnService";

const getLondonDate = (date: Date) => {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/London",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);

	const year = Number(parts.find((part) => part.type === "year")?.value);
	const month = Number(parts.find((part) => part.type === "month")?.value);
	const day = Number(parts.find((part) => part.type === "day")?.value);

	return new Date(year, month - 1, day, 12, 0, 0);
};

const getNextOperationalDate = () => {
	const londonDate = getLondonDate(new Date());

	londonDate.setDate(londonDate.getDate() + 1);

	return londonDate;
};

const getMillisecondsUntilNextLondonMidnight = () => {
	const now = new Date();

	const londonNowParts = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Europe/London",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).formatToParts(now);

	const getPart = (type: string) =>
		Number(londonNowParts.find((part) => part.type === type)?.value);

	const londonNow = new Date(
		getPart("year"),
		getPart("month") - 1,
		getPart("day"),
		getPart("hour"),
		getPart("minute"),
		getPart("second"),
	);

	const nextMidnight = new Date(londonNow);
	nextMidnight.setDate(nextMidnight.getDate() + 1);
	nextMidnight.setHours(0, 0, 0, 0);

	return nextMidnight.getTime() - londonNow.getTime();
};

const generateNextDaySignOnSheet = async (pool: Pool) => {
	const operationalDate = getNextOperationalDate();

	const result = await generateSignOnSheet(pool, operationalDate);

	console.log("Next-day sign-on sheet prepared:", result);
};

export const startSignOnScheduler = async (pool: Pool) => {
	try {
		await generateNextDaySignOnSheet(pool);

		console.log("Sign-on startup fallback completed");
	} catch (error) {
		console.error("Sign-on startup fallback failed:", error);
	}

	const scheduleNextRun = () => {
		const delay = getMillisecondsUntilNextLondonMidnight();

		setTimeout(async () => {
			try {
				await generateNextDaySignOnSheet(pool);
			} catch (error) {
				console.error("Failed to generate next-day sign-on sheet:", error);
			}

			scheduleNextRun();
		}, delay);
	};

	scheduleNextRun();
};
