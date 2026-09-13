import { useState } from "react";

import AppLayout from "./layouts/AppLayout/AppLayout";
import DriverPage from "./pages/DriversPage/DriversPage";
import AllocationPage from "./pages/AllocationPage/AllocationPage";

const App = () => {
	const [selectedPage, setSelectedPage] = useState("Drivers");

	return (
		<AppLayout onSelectNavigation={setSelectedPage}>
			{selectedPage === "Allocation" ? <AllocationPage /> : <DriverPage />}
		</AppLayout>
	);
};

export default App;
