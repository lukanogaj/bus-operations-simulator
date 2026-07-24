import type { Driver } from "../types/driver";

type DriverRotaType = Driver["rota"];

export const driverRotaLabels: Record<DriverRotaType, string> = {
	early: "Early",
	middle: "Middle",
	late: "Late",
	night: "Night",
	spare: "Spare",
};
