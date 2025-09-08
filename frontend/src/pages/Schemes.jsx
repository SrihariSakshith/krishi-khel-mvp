import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Schemes.module.css';

function Schemes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We only need the user's score and streak for this demo
    api.get('/user/dashboard')
       .then(res => setUser(res.data.user))
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading schemes...</p>;

  // This is now the Digital Trust Score
  const eligibilityScore = user.digitalTrustScore;
  const scoreColor = eligibilityScore > 75 ? 'var(--secondary-green)' : eligibilityScore > 50 ? '#FFD700' : '#FF5252';

  return (
    <div className={styles.schemesPage}>
      <h1>Government Schemes Portal</h1>
      <p>Your on-platform activities contribute to a Digital Trust Score, demonstrating your commitment to sustainable and modern farming practices.</p>
      
      <div className={`card ${styles.schemeCard}`}>
        <div className={styles.schemeHeader}>
          <img src="https://upload.wikimedia.org/wikipedia/en/b/b4/Pradhan_Mantri_Fasal_Bima_Yojana_%28PMFBY%29_logo.png" alt="PMFBY Logo" />
          <div>
            <h2>Pradhan Mantri Fasal Bima Yojana (PMFBY)</h2>
            <p>A flagship crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.</p>
          </div>
        </div>

        <div className={styles.eligibilitySection}>
          <h3>Your Digital Trust Score</h3>
          <div className={styles.scoreBox}>
            <div className={styles.score} style={{ color: scoreColor }}>{eligibilityScore}</div>
            <div className={styles.scoreBreakdown}>
              <p>This score is calculated based on:</p>
              <ul>
                <li>✅ Mission Completion</li>
                <li>📈 Consistent Platform Engagement</li>
                <li>🌱 Adoption of Sustainable Practices</li>
              </ul>
            </div>
          </div>
          <p className={styles.infoText}>
            A higher Digital Trust Score acts as a digital record of your diligence as a modern farmer. In a real-world integration, this score could be shared with government agencies to potentially streamline your application process, verify your practices, and fast-track insurance claims or subsidy approvals.
          </p>
          <a href="https://pmfby.gov.in/" target="_blank" rel="noopener noreferrer" className={`primary-btn ${styles.learnMoreBtn}`}>
            Learn More & Apply on Official Site
          </a>
        </div>
      </div>
    </div>
  );
}

export default Schemes;