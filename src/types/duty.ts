import type { Driver } from "./driver";

export interface Duty {
	dutyNumber: number;
	route: Exclude<Driver["route"], "spare">;
	rota: "early" | "middle" | "late";
	signOn: string;
	signOff: string;
}
