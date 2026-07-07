import type { ReactNode } from "react";
import styles from "./MainContent.module.css";

type MainContentProps = {
	children: ReactNode;
};

const MainContent = ({ children }: MainContentProps) => {
	return <main className={styles.contentViewport}>{children}</main>;
};

export default MainContent;
