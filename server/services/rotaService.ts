import type { Pool } from "pg";

export const generateWeeklySnapshot = async (
	pool: Pool,
	startDate: Date,
	currentDate: Date,
) => {
	const routesResult = await pool.query(
		"SELECT route_number FROM routes ORDER BY route_number",
	);

	const routes = routesResult.rows.map((row) => row.route_number);

	const driversResult = await pool.query(
		"SELECT * FROM drivers ORDER BY employee_number",
	);

	const drivers = driversResult.rows;

	const restDayPatternsResult = await pool.query(
		"SELECT * FROM rest_day_patterns ORDER BY week_number",
	);

	const restDayPatterns = restDayPatternsResult.rows;

	const getDriversForRota = (route: string, rota: string, rotaWeek: number) => {
		return drivers.filter(
			(driver) =>
				driver.route === route &&
				driver.rota === rota &&
				driver.rota_week === rotaWeek,
		);
	};

	const getRestDayPattern = (rotaWeek: number) => {
		const pattern = restDayPatterns.find(
			(pattern) => pattern.week_number === rotaWeek,
		);

		if (!pattern) {
			throw new Error(`Rest day pattern not found for week ${rotaWeek}`);
		}

		return pattern;
	};

	const rotas = ["early", "middle", "late"];

	const generateDutyNumber = (
		route: string,
		rota: string,
		rotaWeek: number,
		workDayIndex: number,
	) => {
		const routeIndex = routes.indexOf(route);
		const rotaIndex = rotas.indexOf(rota);

		return (
			routeIndex * 60 + rotaIndex * 20 + (rotaWeek - 1) * 5 + workDayIndex + 1
		);
	};

	const getWeeklyRestPattern = (
		route: string,
		rota: string,
		rotaWeek: number,
	) => {
		const pattern = getRestDayPattern(rotaWeek);

		let workDayIndex = 0;

		const getDayValue = (day: string) => {
			if (day.trim() === "R") {
				return "R";
			}

			const dutyNumber = generateDutyNumber(
				route,
				rota,
				rotaWeek,
				workDayIndex,
			);

			workDayIndex++;

			return dutyNumber;
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

	const getCurrentRotaWeek = (
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
		rota,
	};
};
