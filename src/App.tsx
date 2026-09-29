import { useState } from "react";

import AppLayout from "./layouts/AppLayout/AppLayout";
import AllocationPage from "./pages/AllocationPage/AllocationPage";
import DriverPage from "./pages/DriversPage/DriversPage";
import DutiesPage from "./pages/DutiesPage/DutiesPage";
import LoginPage from "./pages/LoginPage/LoginPage";

type User = {
	id: number;
	username: string;
	role: "manager" | "controller";
};

const App = () => {
	const [selectedPage, setSelectedPage] = useState("Drivers");

	const [user, setUser] = useState<User | null>(() => {
		const storedUser = localStorage.getItem("user");

		return storedUser ? JSON.parse(storedUser) : null;
	});

	const handleLogin = (loggedInUser: User, token: string) => {
		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(loggedInUser));

		setUser(loggedInUser);
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		setUser(null);
		setSelectedPage("Drivers");
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
			{selectedPage === "Allocation" ? (
				<AllocationPage />
			) : selectedPage === "Duties" ? (
				<DutiesPage />
			) : (
				<DriverPage />
			)}
		</AppLayout>
	);
};

export default App;
