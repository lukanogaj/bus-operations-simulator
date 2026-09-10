import { writeFileSync } from "node:fs";
import { driverList } from "../src/data/drivers.ts";

const weekNumbers = [1, 2, 3, 4] as const;

const rotaCounters = {
	early: 0,
	middle: 0,
	late: 0,
	night: 0,
	spare: 0,
};

const updatedDrivers = driverList.map((driver) => {
	const counter = rotaCounters[driver.rota];
	const rotaWeek = weekNumbers[counter % 4];

	rotaCounters[driver.rota]++;

	return {
		...driver,
		rotaWeek,
	};
});

writeFileSync(
	"./src/data/drivers.generated.ts",
	`import type { Driver } from "../types/driver";

export const driverList: Driver[] = ${JSON.stringify(updatedDrivers, null, 2)};
`,
);

console.log("✅ Generated: src/data/drivers.generated.ts");
