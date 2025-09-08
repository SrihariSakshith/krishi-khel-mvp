import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';

const dailyTips = [
    "Did you know? Planting marigolds around your crops can naturally repel pests!",
    "A healthy soil pH is between 6.0 and 7.0. Test your soil regularly.",
    "Crop rotation prevents soil depletion and reduces pest build-up.",
    "Composting kitchen scraps can create nutrient-rich fertilizer for free!",
    "Consider installing a drip irrigation system to save up to 80% more water."
];

const getLevel = (score) => {
    if (score < 100) return { level: 1, next: 100, progress: (score / 100) * 100 };
    if (score < 250) return { level: 2, next: 250, progress: ((score - 100) / 150) * 100 };
    if (score < 500) return { level: 3, next: 500, progress: ((score - 250) / 250) * 100 };
    return { level: 4, next: 1000, progress: ((score - 500) / 500) * 100 };
};

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState('');

  useEffect(() => {
    setDailyTip(dailyTips[new Date().getDate() % dailyTips.length]);
    const fetchData = async () => {
      try {
        const response = await api.get('/user/dashboard');
        setData(response.data);
      } catch (error) { console.error("Failed to fetch dashboard data", error); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <p className={styles.loading}>Loading dashboard...</p>;
  if (!data) return <p>Could not load dashboard data. Please try logging in again.</p>;

  const { user, weather, badges } = data;
  const farmerLevel = getLevel(user.sustainabilityScore);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.welcome}>Welcome, {user.name}!</h1>
        <div className={styles.levelInfo}>
            <span>LVL {farmerLevel.level}</span>
            <div className={styles.xpBar}>
                <div className={styles.xpFill} style={{ width: `${farmerLevel.progress}%` }}></div>
            </div>
            <small>{user.sustainabilityScore} / {farmerLevel.next} PTS</small>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={`card ${styles.mainStats}`}>
            <div className={styles.stat}><span className={styles.statIcon}>🏆</span><div><p className={styles.statValue}>{user.sustainabilityScore}</p><p className={styles.statLabel}>Sustainability Score</p></div></div>
            <div className={styles.stat}><span className={styles.statIcon}>🌍</span><div><p className={styles.statValue}>{user.carbonCreditScore.toFixed(2)}</p><p className={styles.statLabel}>Est. Carbon Credits</p></div></div>
            <div className={styles.stat}><span className={styles.statIcon}>🤝</span><div><p className={styles.statValue}>{user.digitalTrustScore}</p><p className={styles.statLabel}>Digital Trust Score</p></div></div>
            <div className={styles.stat}><span className={styles.statIcon}>🔥</span><div><p className={styles.statValue}>{user.streak}</p><p className={styles.statLabel}>Login Streak</p></div></div>
        </div>

        <div className={`card ${styles.sideCard}`}>
          <h3>Weather in {user.location}</h3>
          {weather && !weather.error ? (
            <div className={styles.weather}><img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} /><div className={styles.weatherInfo}><p className={styles.weatherTemp}>{Math.round(weather.temp)}°C</p><p className={styles.weatherDesc}>{weather.description}</p></div></div>
          ) : (<p>{weather.error || 'Weather data unavailable.'}</p>)}
          <div className={`card ${styles.dailyTip}`}>💡 <strong>Daily Tip:</strong> {dailyTip}</div>
        </div>
        
        <div className={`card ${styles.fullWidthCard}`}>
          <h3>Quick Actions</h3>
          <div className={styles.actions}>
            <Link to="/missions" className={styles.actionBtn}><span>🎯</span> View Missions</Link>
            <Link to="/planner" className={styles.actionBtn}><span>🗺️</span> Farm Planner</Link>
            <Link to="/schemes" className={styles.actionBtn}><span>🇮🇳</span> Govt. Schemes</Link>
            <Link to="/leaderboard" className={styles.actionBtn}><span>🏅</span> Leaderboard</Link>
          </div>
        </div>

        <div className={`card ${styles.fullWidthCard}`}>
          <h3>Your Badges</h3>
          {badges.length > 0 ? (
            <div className={styles.badgeGrid}>
              {badges.map(badge => (
                <div key={badge.id} className={styles.badge}><span className={styles.badgeIcon}>{badge.iconUrl}</span><div className={styles.badgeInfo}><p className={styles.badgeName}>{badge.name}</p><p className={styles.badgeDesc}>{badge.description}</p></div></div>
              ))}
            </div>
          ) : ( <p>Start completing missions to earn badges!</p> )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;