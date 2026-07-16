export interface Driver {
	employeeNumber: number;
	batchNumber: number;
	firstName: string;
	lastName: string;
	status:
		| "available"
		| "sick"
		| "holiday"
		| "training"
		| "suspended"
		| "leaveNotice";
	rota: "early" | "middle" | "late" | "night" | "spare";
	route: string;
}
