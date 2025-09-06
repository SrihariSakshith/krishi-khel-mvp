import { NavLink, useNavigate } from 'react-router-dom';
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
      <div className={styles.logo}>
        <span role="img" aria-label="leaf">🌿</span> Krishi Khel
      </div>
      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>Dashboard</NavLink>
        <NavLink to="/missions" className={({ isActive }) => isActive ? styles.active : ''}>Missions</NavLink>
        <NavLink to="/planner" className={({ isActive }) => isActive ? styles.active : ''}>Farm Planner</NavLink>
        <NavLink to="/diagnose" className={({ isActive }) => isActive ? styles.active : ''}>AI Detector</NavLink>
        <NavLink to="/groups" className={({ isActive }) => isActive ? styles.active : ''}>Groups</NavLink>
      </nav>
      <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
    </header>
  );
}

export default Header;