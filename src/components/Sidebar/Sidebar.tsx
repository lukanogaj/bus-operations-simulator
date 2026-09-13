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
}

const Sidebar = ({ onSelect }: SidebarProps) => {
	return (
		<aside className={styles.sidebarShell}>
			<nav>
				<ul className={styles.navigationList}>
					{navigationItems.map((item) => (
						<li
							key={item}
							className={styles.navigationItem}
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
