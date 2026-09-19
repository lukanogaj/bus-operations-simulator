import { Pool } from "pg";
import { routes } from "../data/routes";
import { generateFullWeeklyRota } from "../utils/generateFullWeeklyRota";
import { generateSignOnTime } from "../utils/generateSignOnTime";

const pool = new Pool({
	connectionString: "postgres://localhost:5432/bus_operations_simulator",
});

const rotas: ("early" | "middle" | "late")[] = ["early", "middle", "late"];

const migrate = async () => {
	let dutyCounter = 1000;

	for (const route of routes) {
		for (const rota of rotas) {
			const totalDuties = 4;

			for (let position = 0; position < totalDuties; position++) {
				const signOn = generateSignOnTime(rota, position, totalDuties);
				const signOff = signOn;

				await pool.query(
					`INSERT INTO duties (duty_number, route, rota, sign_on, sign_off)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (duty_number) DO NOTHING`,
					[dutyCounter, route, rota, signOn, signOff],
				);

				dutyCounter++;
			}
		}
	}

	console.log(`Migrated ${dutyCounter - 1000} duties.`);
	await pool.end();
};

migrate().catch((error) => {
	console.error("Migration failed:", error);
	process.exit(1);
});
