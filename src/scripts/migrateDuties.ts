import { Pool } from "pg";
import { routes } from "../data/routes";
import { generateSignOnTime } from "../utils/generateSignOnTime";

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

const rotas = ["early", "middle", "late"] as const;
const rotaWeeks = [1, 2, 3, 4] as const;

const migrate = async () => {
	let migratedDuties = 0;

	for (const route of routes) {
		const routeIndex = routes.indexOf(route);

		for (const rota of rotas) {
			const rotaIndex = rotas.indexOf(rota);

			for (const rotaWeek of rotaWeeks) {
				const totalDuties = 5;

				for (let workDayIndex = 0; workDayIndex < totalDuties; workDayIndex++) {
					const dutyNumber =
						routeIndex * 60 +
						rotaIndex * 20 +
						(rotaWeek - 1) * 5 +
						workDayIndex +
						1;

					const signOn = generateSignOnTime(rota, workDayIndex, totalDuties);

					const [hours, minutes] = signOn.split(":").map(Number);
					const signOffHours = (hours + 8) % 24;

					const signOff = `${String(signOffHours).padStart(
						2,
						"0",
					)}:${String(minutes).padStart(2, "0")}`;

					await pool.query(
						`INSERT INTO duties (
							duty_number,
							route,
							rota,
							sign_on,
							sign_off
						)
						VALUES ($1, $2, $3, $4, $5)
						ON CONFLICT (duty_number) DO NOTHING`,
						[dutyNumber, route, rota, signOn, signOff],
					);

					migratedDuties++;
				}
			}
		}
	}

	console.log(`Migrated ${migratedDuties} duties.`);
	await pool.end();
};

migrate().catch((error) => {
	console.error("Migration failed:", error);
	process.exit(1);
});
