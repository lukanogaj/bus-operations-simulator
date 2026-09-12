type RotaDay = "R" | number;

export interface RotaAllocationRow {
	route: string;
	rota: "early" | "middle" | "late" | "spare";
	employeeNumber: number;
	position: number;
	rotaWeek: 1 | 2 | 3 | 4;

	saturday: RotaDay;
	sunday: RotaDay;
	monday: RotaDay;
	tuesday: RotaDay;
	wednesday: RotaDay;
	thursday: RotaDay;
	friday: RotaDay;
}
