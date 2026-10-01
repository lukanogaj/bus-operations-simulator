import type { Pool } from "pg";

type Duty = {
	duty_number: number;
	route: string;
	rota: "early" | "middle" | "late";
	sign_on: string;
	sign_off: string;
};

export const getCurrentRotaWeek = (
	baseRotaWeek: number,
	startDate: Date,
	currentDate: Date,
) => {
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

	return ((baseRotaWeek - 1 + elapsedWeeks) % 4) + 1;
};

export const generateWeeklySnapshot = async (
	pool: Pool,
	startDate: Date,
	currentDate: Date,
) => {
	// =========================================================
	// DATABASE
	// =========================================================

	const routesResult = await pool.query(
		"SELECT route_number FROM routes ORDER BY route_number",
	);

	const routes: string[] = routesResult.rows.map((row) => row.route_number);

	const driversResult = await pool.query(
		"SELECT * FROM drivers ORDER BY employee_number",
	);

	const drivers = driversResult.rows;

	const dutiesResult = await pool.query(
		"SELECT * FROM duties ORDER BY duty_number",
	);

	const duties: Duty[] = dutiesResult.rows;

	const restDayPatternsResult = await pool.query(
		"SELECT * FROM rest_day_patterns ORDER BY week_number",
	);

	const restDayPatterns = restDayPatternsResult.rows;

	// =========================================================
	// DRIVERS
	// =========================================================

	const getDriversForRota = (route: string, rota: string, rotaWeek: number) => {
		return drivers.filter(
			(driver) =>
				driver.route === route &&
				driver.rota === rota &&
				driver.rota_week === rotaWeek,
		);
	};

	// =========================================================
	// REST DAY PATTERNS
	// =========================================================

	const getRestDayPattern = (rotaWeek: number) => {
		const pattern = restDayPatterns.find(
			(pattern) => pattern.week_number === rotaWeek,
		);

		if (!pattern) {
			throw new Error(`Rest day pattern not found for week ${rotaWeek}`);
		}

		return pattern;
	};

	// =========================================================
	// DUTIES
	// PostgreSQL is now the source of truth.
	// =========================================================

	const getDutiesForRotaWeek = (
		route: string,
		rota: string,
		rotaWeek: number,
	) => {
		const rotaDuties = duties.filter(
			(duty) => duty.route === route && duty.rota === rota,
		);

		const startIndex = (rotaWeek - 1) * 5;
		const endIndex = startIndex + 5;

		const weekDuties = rotaDuties.slice(startIndex, endIndex);

		if (weekDuties.length !== 5) {
			throw new Error(
				`Expected 5 duties for route ${route}, rota ${rota}, week ${rotaWeek}, found ${weekDuties.length}`,
			);
		}

		return weekDuties;
	};

	// =========================================================
	// WEEKLY WORK / REST PATTERN
	// =========================================================

	const getWeeklyRestPattern = (
		route: string,
		rota: string,
		rotaWeek: number,
	) => {
		const pattern = getRestDayPattern(rotaWeek);

		const weekDuties = getDutiesForRotaWeek(route, rota, rotaWeek);

		let workDayIndex = 0;

		const getDayValue = (day: string) => {
			if (day.trim() === "R") {
				return "R";
			}

			const duty = weekDuties[workDayIndex];

			if (!duty) {
				throw new Error(
					`Duty not found for route ${route}, rota ${rota}, week ${rotaWeek}, work day ${workDayIndex + 1}`,
				);
			}

			workDayIndex++;

			return duty.duty_number;
		};

		return {
			weekNumber: pattern.week_number,
			saturday: getDayValue(pattern.saturday),
			sunday: getDayValue(pattern.sunday),
			monday: getDayValue(pattern.monday),
			tuesday: getDayValue(pattern.tuesday),
			wednesday: getDayValue(pattern.wednesday),
			thursday: getDayValue(pattern.thursday),
			friday: getDayValue(pattern.friday),
		};
	};

	// =========================================================
	// ROTA GENERATION
	// =========================================================

	const rotaWeeks = [1, 2, 3, 4];

	const generateRotaRows = (route: string, rota: string) => {
		return rotaWeeks.flatMap((week) => {
			const rotaDrivers = getDriversForRota(route, rota, week);

			return rotaDrivers.map((driver) => {
				const currentRotaWeek = getCurrentRotaWeek(
					driver.rota_week,
					startDate,
					currentDate,
				);

				const weeklyPattern = getWeeklyRestPattern(
					route,
					rota,
					currentRotaWeek,
				);

				return {
					route,
					rota,
					employeeNumber: driver.employee_number,
					firstName: driver.first_name,
					lastName: driver.last_name,
					position: week,
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
		});
	};

	// =========================================================
	// ROUTE ALLOCATION
	// =========================================================

	const generateRouteAllocation = (route: string) => {
		return {
			early: generateRotaRows(route, "early"),
			middle: generateRotaRows(route, "middle"),
			late: generateRotaRows(route, "late"),
		};
	};

	const rota = routes.map((route) => ({
		route,
		allocation: generateRouteAllocation(route),
	}));

	// =========================================================
	// WEEK COMMENCING
	// =========================================================

	const weekStart = new Date(currentDate);

	const daysSinceSaturday = (weekStart.getDay() + 1) % 7;

	weekStart.setDate(weekStart.getDate() - daysSinceSaturday);

	const year = weekStart.getFullYear();
	const month = String(weekStart.getMonth() + 1).padStart(2, "0");
	const day = String(weekStart.getDate()).padStart(2, "0");

	const weekCommencing = `${year}-${month}-${day}`;

	// =========================================================
	// SNAPSHOT
	// =========================================================

	return {
		weekCommencing,
		generatedAt: new Date().toISOString(),
		rota,
	};
};
