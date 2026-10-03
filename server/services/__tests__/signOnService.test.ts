import { describe, expect, it, vi } from "vitest";
import type { Pool } from "pg";

import { markDriverAbsent } from "../signOnService";

describe("Sign-On", () => {
	it("marks a LATE driver as ABSENT", async () => {
		const query = vi.fn().mockResolvedValue({
			rowCount: 1,
			rows: [
				{
					id: 340,
					operational_date: "2026-10-03",
					driver_number: 1012868,
					duty_number: 6,
					signed_on_at: null,
					status: "ABSENT",
				},
			],
		});

		const pool = {
			query,
		} as unknown as Pool;

		const result = await markDriverAbsent(pool, 340);

		expect(result.status).toBe("ABSENT");
		expect(result.driver_number).toBe(1012868);
		expect(result.duty_number).toBe(6);

		expect(query).toHaveBeenCalledTimes(1);

		expect(query).toHaveBeenCalledWith(
			expect.stringContaining("AND status = 'LATE'"),
			[340],
		);
	});

	it("rejects marking a non-LATE driver as ABSENT", async () => {
		const query = vi
			.fn()
			.mockResolvedValueOnce({
				rowCount: 0,
				rows: [],
			})
			.mockResolvedValueOnce({
				rowCount: 1,
				rows: [
					{
						status: "EXPECTED",
					},
				],
			});

		const pool = {
			query,
		} as unknown as Pool;

		await expect(markDriverAbsent(pool, 340)).rejects.toThrow(
			"Only a late driver can be marked absent",
		);

		expect(query).toHaveBeenCalledTimes(2);
	});

	it("returns not found when the sign-on entry does not exist", async () => {
		const query = vi
			.fn()
			.mockResolvedValueOnce({
				rowCount: 0,
				rows: [],
			})
			.mockResolvedValueOnce({
				rowCount: 0,
				rows: [],
			});

		const pool = {
			query,
		} as unknown as Pool;

		await expect(markDriverAbsent(pool, 999999)).rejects.toThrow(
			"Sign-on entry not found",
		);

		expect(query).toHaveBeenCalledTimes(2);
	});
});
