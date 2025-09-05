import React, { useState, useEffect } from 'react';
import api from '../services/api';
import VoiceSpeaker from '../components/VoiceSpeaker';
import styles from './Dashboard.module.css';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/user/dashboard');
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className={styles.loading}>Loading dashboard...</p>;
  if (!data) return <p>Could not load dashboard data.</p>;

  const { user, weather, badges } = data;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.welcome}>Welcome back, {user.name}!</h1>

      <div className={styles.grid}>
        <div className="card">
          <h3>Your Stats</h3>
          <div className={styles.stat}>
            <span className={styles.statIcon}>🏆</span>
            <div>
              <p className={styles.statValue}>{user.sustainabilityScore}</p>
              <p className={styles.statLabel}>Sustainability Score</p>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>🔥</span>
            <div>
              <p className={styles.statValue}>{user.streak}</p>
              <p className={styles.statLabel}>Login Streak</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Weather in {user.location} <VoiceSpeaker textToSpeak={`Current weather in ${user.location} is ${weather.temp} degrees Celsius with ${weather.description}.`} /></h3>
          {weather && !weather.error ? (
            <div className={styles.weather}>
              <img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} />
              <div className={styles.weatherInfo}>
                <p className={styles.weatherTemp}>{weather.temp}°C</p>
                <p className={styles.weatherDesc}>{weather.description}</p>
              </div>
            </div>
          ) : (
            <p>{weather.error || 'Weather data unavailable.'}</p>
          )}
        </div>

        <div className={`card ${styles.fullWidthCard}`}>
          <h3>Your Missions & Reminders</h3>
          <ul className={styles.missionList}>
            <li>Complete your Farm Plan to earn the "Farm Planner" badge! <VoiceSpeaker textToSpeak="Your mission is to complete your farm plan." /></li>
            <li>Post in the community group to connect with other farmers.</li>
            <li>Check your soil health this week.</li>
          </ul>
        </div>
        
        <div className={`card ${styles.fullWidthCard}`}>
          <h3>Your Badges</h3>
          {badges.length > 0 ? (
            <div className={styles.badgeGrid}>
              {badges.map(badge => (
                <div key={badge.id} className={styles.badge}>
                  <span className={styles.badgeIcon}>{badge.iconUrl}</span>
                  <div className={styles.badgeInfo}>
                    <p className={styles.badgeName}>{badge.name}</p>
                    <p className={styles.badgeDesc}>{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Start completing missions to earn badges!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;