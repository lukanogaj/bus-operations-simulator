import type { ReactNode } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import MainContent from "../../components/MainContent/MainContent";

import styles from "./AppLayout.module.css";

type AppLayoutProps = {
	children: ReactNode;
	onSelectNavigation: (item: string) => void;
	selectedPage: string;
};

const AppLayout = ({
	children,
	onSelectNavigation,
	selectedPage,
}: AppLayoutProps) => {
	return (
		<div className={styles.appFrame}>
			<Sidebar
				onSelect={onSelectNavigation}
				selectedItem={selectedPage}
			/>

			<section className={styles.workspaceArea}>
				<Header />

				<MainContent>{children}</MainContent>
			</section>
		</div>
	);
};

export default AppLayout;
