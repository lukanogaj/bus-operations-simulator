import type { ReactNode } from "react";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import MainContent from "../../components/MainContent/MainContent";

import styles from "./AppLayout.module.css";

type AppLayoutProps = {
	children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
	return (
		<div className={styles.appFrame}>
			<Sidebar />

			<section className={styles.workspaceArea}>
				<Header />

				<MainContent>{children}</MainContent>
			</section>
		</div>
	);
};

export default AppLayout;
