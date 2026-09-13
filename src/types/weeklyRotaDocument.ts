export interface WeeklyRotaDocument {
	id: string;
	weekCommencing: string;
	generatedAt: string;
	pdfPath: string;
	status: "current" | "archived";
}
