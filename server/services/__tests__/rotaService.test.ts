import { describe, expect, it } from "vitest";

import { getCurrentRotaWeek } from "../rotaService";

describe("getCurrentRotaWeek", () => {
	it("keeps the same rota week when less than one week has passed", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-05");

		const result = getCurrentRotaWeek(1, startDate, currentDate);

		expect(result).toBe(1);
	});

	it("moves to the next rota week after one full week", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-08");

		const result = getCurrentRotaWeek(1, startDate, currentDate);

		expect(result).toBe(2);
	});

	it("moves through the rota weeks correctly", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-22");

		const result = getCurrentRotaWeek(1, startDate, currentDate);

		expect(result).toBe(4);
	});

	it("returns to week 1 after the four-week cycle", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-29");

		const result = getCurrentRotaWeek(1, startDate, currentDate);

		expect(result).toBe(1);
	});

	it("rotates correctly when the driver starts on a different rota week", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-15");

		const result = getCurrentRotaWeek(3, startDate, currentDate);

		expect(result).toBe(1);
	});

	it("keeps week 4 before the first full week has passed", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-07");

		const result = getCurrentRotaWeek(4, startDate, currentDate);

		expect(result).toBe(4);
	});

	it("wraps from week 4 to week 1 after one full week", () => {
		const startDate = new Date("2026-01-01");
		const currentDate = new Date("2026-01-08");

		const result = getCurrentRotaWeek(4, startDate, currentDate);

		expect(result).toBe(1);
	});
});
