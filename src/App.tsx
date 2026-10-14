import { useState } from "react";

import AppLayout from "./layouts/AppLayout/AppLayout";
import AdminPage from "./pages/AdminPage/AdminPage";
import AllocationPage from "./pages/AllocationPage/AllocationPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import DriverPage from "./pages/DriversPage/DriversPage";
import DutiesPage from "./pages/DutiesPage/DutiesPage";
import IncidentsPage from "./pages/IncidentsPage/IncidentsPage";
import OperationsPage from "./pages/OperationsPage/OperationsPage";
import PlannedAbsencesPage from "./pages/PlannedAbsencesPage/PlannedAbsencesPage";
import ReportsPage from "./pages/ReportsPage/ReportsPage";
import SignOnPage from "./pages/SignOnPage/SignOnPage";

type User = {
	id: number;
	username: string;
	role: "manager" | "garage_supervisor";
};

const App = () => {
	const [selectedPage, setSelectedPage] = useState("Dashboard");

	const user: User = {
		id: 1,
		username: "portfolio",
		role: "manager",
	};

	return (
		<AppLayout
			onSelectNavigation={setSelectedPage}
			selectedPage={selectedPage}
			user={user}>
			{selectedPage === "Dashboard" ? (
				<DashboardPage />
			) : selectedPage === "Allocation" ? (
				<AllocationPage />
			) : selectedPage === "Duties" ? (
				<DutiesPage />
			) : selectedPage === "Operations Board" ? (
				<OperationsPage />
			) : selectedPage === "Planned Absences" ? (
				<PlannedAbsencesPage />
			) : selectedPage === "Incidents" ? (
				<IncidentsPage />
			) : selectedPage === "Sign-On Sheet" ? (
				<SignOnPage />
			) : selectedPage === "Reports" ? (
				<ReportsPage />
			) : selectedPage === "Admin" && user.role === "manager" ? (
				<AdminPage />
			) : (
				<DriverPage />
			)}
		</AppLayout>
	);
};

export default App;
