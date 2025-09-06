import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Missions.module.css';

function Missions() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/missions')
      .then(res => setMissions(res.data))
      .catch(err => setError('Failed to load missions.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading missions...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div>
      <h1>Your Missions</h1>
      <p>Complete these tasks to improve your farm's sustainability and earn points!</p>
      <div className={styles.missionGrid}>
        {missions.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}

function MissionCard({ mission }) {
  const [proof, setProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mission.status === 'COMPLETED') return;
    if (!proof) {
      setError('Please upload a photo as proof.');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('proof', proof);

    try {
      const res = await api.post(`/missions/${mission.id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(res.data.message);
      // Ideally, you'd refetch missions here or update state via a context
      mission.status = 'COMPLETED'; 
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`card ${mission.status === 'COMPLETED' ? styles.completed : ''}`}>
      <div className={styles.header}>
        <h3>{mission.title}</h3>
        {mission.status === 'COMPLETED' && <span className={styles.completedTag}>✔ Completed</span>}
      </div>
      <p>{mission.description}</p>
      <div className={styles.rewards}>
        <span>🏆 +{mission.sustainabilityPoints} Points</span>
        <span>🌍 +{mission.carbonCreditPoints.toFixed(2)} Credits</span>
      </div>
      {mission.status !== 'COMPLETED' && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>Upload Proof:</label>
          <input type="file" onChange={(e) => setProof(e.target.files[0])} required />
          <button type="submit" disabled={isSubmitting} className="primary-btn">
            {isSubmitting ? 'Submitting...' : 'Complete Mission'}
          </button>
        </form>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
    </div>
  );
}

export default Missions;