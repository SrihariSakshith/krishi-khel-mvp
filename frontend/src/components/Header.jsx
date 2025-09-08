import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Header.module.css';

function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span role="img" aria-label="leaf">🌿</span> Krishi Khel
      </Link>
      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>
        <NavLink to="/missions" className={({ isActive }) => isActive ? styles.active : ''}>Missions</NavLink>
        <NavLink to="/planner" className={({ isActive }) => isActive ? styles.active : ''}>Farm Planner</NavLink>
        <NavLink to="/schemes" className={({ isActive }) => isActive ? styles.active : ''}>Govt. Schemes</NavLink>
        <NavLink to="/groups" className={({ isActive }) => isActive ? styles.active : ''}>Community</NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => isActive ? styles.active : ''}>Leaderboard</NavLink>
      </nav>
      <div className={styles.userMenu}>
        <NavLink to="/diagnose" className={styles.iconBtn} title="AI Crop Doctor">🔬</NavLink>
        <NavLink to="/chatbot" className={styles.iconBtn} title="Krishi Mitra AI">💬</NavLink>
        <NavLink to="/profile" className={styles.iconBtn} title="My Profile">👤</NavLink>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </div>
    </header>
  );
}

export default Header;