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

interface SidebarProps {
	onSelect: (item: string) => void;
	selectedItem: string;
}

const Sidebar = ({ onSelect, selectedItem }: SidebarProps) => {
	return (
		<aside className={styles.sidebarShell}>
			<nav>
				<ul className={styles.navigationList}>
					{navigationItems.map((item) => (
						<li
							key={item}
							className={
								item === selectedItem
									? `${styles.navigationItem} ${styles.active}`
									: styles.navigationItem
							}
							onClick={() => onSelect(item)}>
							{item}
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
};

export default Sidebar;
