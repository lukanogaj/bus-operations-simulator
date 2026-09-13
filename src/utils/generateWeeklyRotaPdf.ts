import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { driverList } from "../data/drivers";
import type { WeeklyRotaDocument } from "../types/weeklyRotaDocument";

type RotaRow = {
	employeeNumber: number;
	rotaWeek: 1 | 2 | 3 | 4;
	saturday: "R" | number;
	sunday: "R" | number;
	monday: "R" | number;
	tuesday: "R" | number;
	wednesday: "R" | number;
	thursday: "R" | number;
	friday: "R" | number;
};

type Snapshot = {
	weekCommencing: string;
	generatedAt: string;
	rota: Array<{
		route: string;
		allocation: {
			early: RotaRow[];
			middle: RotaRow[];
			late: RotaRow[];
		};
	}>;
};

export const generateWeeklyRotaPdf = (
	snapshot: Snapshot,
): WeeklyRotaDocument => {
	const doc = new jsPDF({
		orientation: "landscape",
		unit: "mm",
		format: "a4",
	});

	const getDriverName = (employeeNumber: number) => {
		const driver = driverList.find(
			(driver) => driver.employeeNumber === employeeNumber,
		);

		if (!driver) {
			return "Unknown Driver";
		}

		return `${driver.firstName} ${driver.lastName}`;
	};

	const formatDate = (date: string) => {
		const [year, month, day] = date.split("-");

		return `${day}/${month}/${year}`;
	};

	snapshot.rota.forEach((routeData, routeIndex) => {
		if (routeIndex > 0) {
			doc.addPage();
		}

		doc.setFont("helvetica", "bold");
		doc.setFontSize(20);

		doc.text(`Route ${routeData.route}`, 14, 16);

		doc.setFontSize(16);

		doc.text(`W/C: ${formatDate(snapshot.weekCommencing)}`, 210, 16);

		let startY = 24;

		const sections = [
			{
				title: "EARLY",
				rows: routeData.allocation.early,
			},
			{
				title: "MIDDLE",
				rows: routeData.allocation.middle,
			},
			{
				title: "LATE",
				rows: routeData.allocation.late,
			},
		];

		for (const section of sections) {
			doc.setFontSize(11);
			doc.setFont("helvetica", "bold");

			doc.text(section.title, 14, startY);

			autoTable(doc, {
				startY: startY + 3,

				head: [
					["PAY NO", "NAME", "SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"],
				],

				body: section.rows.map((row) => [
					row.employeeNumber,
					getDriverName(row.employeeNumber),
					row.saturday,
					row.sunday,
					row.monday,
					row.tuesday,
					row.wednesday,
					row.thursday,
					row.friday,
				]),

				theme: "grid",

				styles: {
					font: "helvetica",
					fontSize: 9,
					halign: "center",
					valign: "middle",
					cellPadding: 2,
				},

				headStyles: {
					fillColor: [245, 158, 11],
					textColor: [17, 24, 39],
					fontStyle: "bold",
				},

				columnStyles: {
					0: {
						cellWidth: 25,
					},

					1: {
						cellWidth: 60,
						halign: "left",
					},

					2: {
						cellWidth: 24,
					},

					3: {
						cellWidth: 24,
					},

					4: {
						cellWidth: 24,
					},

					5: {
						cellWidth: 24,
					},

					6: {
						cellWidth: 24,
					},

					7: {
						cellWidth: 24,
					},

					8: {
						cellWidth: 24,
					},
				},

				didParseCell: (data) => {
					if (
						data.section === "body" &&
						typeof data.cell.raw === "string" &&
						data.cell.raw === "R"
					) {
						data.cell.styles.fontStyle = "bold";
						data.cell.styles.fillColor = [229, 231, 235];
					}
				},

				margin: {
					left: 14,
					right: 14,
				},
			});

			const finalY =
				(
					doc as jsPDF & {
						lastAutoTable?: {
							finalY: number;
						};
					}
				).lastAutoTable?.finalY ?? startY;

			startY = finalY + 8;
		}

		doc.setFontSize(8);
		doc.setFont("helvetica", "normal");
		doc.setTextColor(120);

		doc.text(`Generated: ${snapshot.generatedAt}`, 14, 202);

		doc.setTextColor(0);
	});

	const fileName = `rota-${snapshot.weekCommencing}.pdf`;

	const pdfUrl = doc.output("bloburl").toString();

	window.open(pdfUrl, "_blank");

	return {
		id: crypto.randomUUID(),
		weekCommencing: snapshot.weekCommencing,
		generatedAt: snapshot.generatedAt,
		pdfPath: fileName,
		status: "current",
	};
};
