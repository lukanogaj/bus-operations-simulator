import type { WeeklyRotaDocument } from "../types/weeklyRotaDocument";

const MAX_ARCHIVED_DOCUMENTS = 52;

export const publishWeeklyRota = (
	documents: WeeklyRotaDocument[],
	newDocument: WeeklyRotaDocument,
): WeeklyRotaDocument[] => {
	const archivedDocuments = documents.map((document) => ({
		...document,
		status: "archived" as const,
	}));

	const sortedArchive = archivedDocuments
		.sort(
			(a, b) =>
				new Date(b.weekCommencing).getTime() -
				new Date(a.weekCommencing).getTime(),
		)
		.slice(0, MAX_ARCHIVED_DOCUMENTS);

	const currentDocument: WeeklyRotaDocument = {
		...newDocument,
		status: "current",
	};

	return [currentDocument, ...sortedArchive];
};
