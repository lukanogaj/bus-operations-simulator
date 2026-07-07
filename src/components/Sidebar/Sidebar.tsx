import styles from "./Sidebar.module.css";

const navigationItems = [
	"Dashboard",
	"Drivers",
	"Duties",
	"Vehicles",
	"Allocation",
	"Operations Board",
	"Incidents",
	"Reports",
	"Admin",
];

const Sidebar = () => {
	return (
		<aside className={styles.sidebarShell}>
			<nav>
				<ul className={styles.navigationList}>
					{navigationItems.map((item) => (
						<li
							key={item}
							className={styles.navigationItem}>
							{item}
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
};

export default Sidebar;
