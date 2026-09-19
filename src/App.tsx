import { useState } from "react";

import AppLayout from "./layouts/AppLayout/AppLayout";
import DriverPage from "./pages/DriversPage/DriversPage";
import AllocationPage from "./pages/AllocationPage/AllocationPage";
import DutiesPage from "./pages/DutiesPage/DutiesPage";

const App = () => {
	const [selectedPage, setSelectedPage] = useState("Drivers");

	return (
		<AppLayout
			onSelectNavigation={setSelectedPage}
			selectedPage={selectedPage}>
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
