import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Leaderboard.module.css';

function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState({ national: [], district: [] });
  const [activeTab, setActiveTab] = useState('national');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(res => setLeaderboards(res.data))
      .catch(err => console.error("Failed to fetch leaderboards", err))
      .finally(() => setLoading(false));
  }, []);

  const dataToShow = activeTab === 'national' ? leaderboards.national : leaderboards.district;
  const title = activeTab === 'national' ? 'National Leaderboard' : `My District Leaderboard (${dataToShow[0]?.location || ''})`;

  return (
    <div className={styles.leaderboardPage}>
      <h1>🏆 Leaderboards</h1>
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('national')} className={activeTab === 'national' ? styles.active : ''}>National</button>
        <button onClick={() => setActiveTab('district')} className={activeTab === 'district' ? styles.active : ''}>My District</button>
      </div>
      <div className="card">
        <h3>{title}</h3>
        {loading ? <p>Loading...</p> : (
          <ol className={styles.leaderboardList}>
            {dataToShow.map((user, index) => (
              <li key={user.id} className={styles.leaderboardItem}>
                <span className={styles.rank}>{index + 1}</span>
                <span className={styles.name}>{user.name}</span>
                <span className={styles.location}>{user.location}</span>
                <span className={styles.score}>{user.sustainabilityScore} PTS</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;