import type { Driver } from "../types/driver";

type DriverStatusType = Driver["status"];

type DriverStatusConfig = {
	label: string;
	className: string;
};

export const driverStatusConfig: Record<DriverStatusType, DriverStatusConfig> =
	{
		available: {
			label: "Available",
			className: "statusAvailable",
		},
		sick: {
			label: "Sick",
			className: "statusSick",
		},
		holiday: {
			label: "Holiday",
			className: "statusHoliday",
		},
		training: {
			label: "Training",
			className: "statusTraining",
		},
		suspended: {
			label: "Suspended",
			className: "statusSuspended",
		},
		leaveNotice: {
			label: "On Leave",
			className: "statusLeaveNotice",
		},
	};
