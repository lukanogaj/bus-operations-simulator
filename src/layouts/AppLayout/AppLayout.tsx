import type { ReactNode } from "react";

import Header from "../../components/Header/Header";
import MainContent from "../../components/MainContent/MainContent";
import Sidebar from "../../components/Sidebar/Sidebar";

import styles from "./AppLayout.module.css";

type User = {
	id: number;
	username: string;
	role: "manager" | "garage_supervisor";
};

type AppLayoutProps = {
	children: ReactNode;
	onSelectNavigation: (item: string) => void;
	selectedPage: string;
	user: User;
	onLogout: () => void;
};

const AppLayout = ({
	children,
	onSelectNavigation,
	selectedPage,
	user,
	onLogout,
}: AppLayoutProps) => {
	return (
		<div className={styles.appFrame}>
			<Sidebar
				onSelect={onSelectNavigation}
				selectedItem={selectedPage}
				user={user}
				onLogout={onLogout}
			/>

			<section className={styles.workspaceArea}>
				<Header />

				<MainContent>{children}</MainContent>
			</section>
		</div>
	);
};

export default AppLayout;
