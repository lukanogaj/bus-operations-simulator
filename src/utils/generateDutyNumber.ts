import { routes } from "../data/routes";
import type { Driver } from "../types/driver";

const rotas: Array<Extract<Driver["rota"], "early" | "middle" | "late">> = [
	"early",
	"middle",
	"late",
];

export const generateDutyNumber = (
	route: Driver["route"],
	rota: "early" | "middle" | "late",
	rotaWeek: 1 | 2 | 3 | 4,
	workDayIndex: number,
): number => {
	if (route === "spare") {
		throw new Error("Spare drivers do not use line duty numbers");
	}

	const routeIndex = routes.indexOf(route);
	const rotaIndex = rotas.indexOf(rota);

	return (
		routeIndex * 60 + rotaIndex * 20 + (rotaWeek - 1) * 5 + workDayIndex + 1
	);
};
