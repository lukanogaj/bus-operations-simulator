import styles from "./Sidebar.module.css";

type User = {
	id: number;
	username: string;
	role: "manager" | "controller";
};

const navigationItems = [
	"Dashboard",
	"Drivers",
	"Duties",
	"Allocation",
	"Operations Board",
	"Incidents",
	"Sign-On Sheet",
	"Reports",
	"Admin",
];

interface SidebarProps {
	onSelect: (item: string) => void;
	selectedItem: string;
	user: User;
	onLogout: () => void;
}

const getDisplayName = (username: string) => {
	return username
		.split(".")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
};

const Sidebar = ({ onSelect, selectedItem, user, onLogout }: SidebarProps) => {
	const displayName = getDisplayName(user.username);

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

			<div className={styles.userSection}>
				<div className={styles.userName}>{displayName}</div>

				<div className={styles.userRole}>
					{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
				</div>

				<button
					type='button'
					className={styles.logoutButton}
					onClick={onLogout}>
					Logout
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
