import { useState } from "react";

import AppLayout from "./layouts/AppLayout/AppLayout";
import AdminPage from "./pages/AdminPage/AdminPage";
import AllocationPage from "./pages/AllocationPage/AllocationPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import DriverPage from "./pages/DriversPage/DriversPage";
import DutiesPage from "./pages/DutiesPage/DutiesPage";
import IncidentsPage from "./pages/IncidentsPage/IncidentsPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import OperationsPage from "./pages/OperationsPage/OperationsPage";
import ReportsPage from "./pages/ReportsPage/ReportsPage";
import SignOnPage from "./pages/SignOnPage/SignOnPage";

type User = {
	id: number;
	username: string;
	role: "manager" | "garage_supervisor";
};

const App = () => {
	const [selectedPage, setSelectedPage] = useState("Dashboard");

	const [user, setUser] = useState<User | null>(() => {
		const storedUser = localStorage.getItem("user");

		return storedUser ? JSON.parse(storedUser) : null;
	});

	const handleLogin = (loggedInUser: User, token: string) => {
		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(loggedInUser));

		setUser(loggedInUser);
		setSelectedPage("Dashboard");
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		setUser(null);
		setSelectedPage("Dashboard");
	};

	if (!user) {
		return <LoginPage onLogin={handleLogin} />;
	}

	return (
		<AppLayout
			onSelectNavigation={setSelectedPage}
			selectedPage={selectedPage}
			user={user}
			onLogout={handleLogout}>
			{selectedPage === "Dashboard" ? (
				<DashboardPage />
			) : selectedPage === "Allocation" ? (
				<AllocationPage />
			) : selectedPage === "Duties" ? (
				<DutiesPage />
			) : selectedPage === "Operations Board" ? (
				<OperationsPage />
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
