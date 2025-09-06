import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Profile.module.css';

const keralaDistricts = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", 
  "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

function Profile() {
  const [profile, setProfile] = useState({ name: '', location: '', farmSize: '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/profile/me').then(res => setProfile(res.data));
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handlePasswordChange = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/profile/me', profile);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api.put('/profile/change-password', password);
      setMessage('Password changed successfully!');
      setPassword({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.');
    }
  };

  if (!profile.name) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className={styles.profilePage}>
      <h1>My Profile</h1>
      <div className={styles.profileGrid}>
        <div className="card">
          <h3>Update Your Details</h3>
          <form onSubmit={handleProfileSubmit}>
            <label>Full Name</label>
            <input type="text" name="name" value={profile.name} onChange={handleProfileChange} />
            <label>Phone Number (Read-only)</label>
            <input type="text" name="phone" value={profile.phone} disabled />
            <label>Your District</label>
            <select name="location" value={profile.location} onChange={handleProfileChange} required>
              {keralaDistricts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <label>Farm Size (in acres)</label>
            <input type="number" name="farmSize" value={profile.farmSize} onChange={handleProfileChange} />
            <button type="submit" className="primary-btn">Save Profile</button>
          </form>
        </div>
        <div className="card">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <label>Current Password</label>
            <input type="password" name="currentPassword" value={password.currentPassword} onChange={handlePasswordChange} />
            <label>New Password</label>
            <input type="password" name="newPassword" value={password.newPassword} onChange={handlePasswordChange} />
            <button type="submit" className="primary-btn">Change Password</button>
          </form>
        </div>
      </div>
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default Profile;