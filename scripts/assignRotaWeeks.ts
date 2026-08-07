import { writeFileSync } from "node:fs";
import { driverList } from "../src/data/drivers";

const weekNumbers = [1, 2, 3, 4] as const;

const updatedDrivers = driverList.map((driver, index) => ({
	...driver,
	rotaWeek: weekNumbers[index % 4],
}));

writeFileSync(
	"./src/data/drivers.generated.ts",
	`import type { Driver } from "../types/driver";

export const driverList: Driver[] = ${JSON.stringify(updatedDrivers, null, 2)};`,
);

console.log("✅ Generated: src/data/drivers.generated.ts");
