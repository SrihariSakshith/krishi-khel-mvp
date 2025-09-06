import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import styles from './Login.module.css';

const keralaDistricts = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", 
  "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

function Login() {
  const [activeTab, setActiveTab] = useState('login');
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'login' ? styles.active : ''}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={activeTab === 'register' ? styles.active : ''}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        {activeTab === 'login' ? <LoginForm /> : <RegisterForm setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
}

function LoginForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { phone, password });
      setToken(response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleLogin} className={styles.form}>
      <h2>Welcome Back!</h2>
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className="primary-btn">Login</button>
    </form>
  );
}

function RegisterForm({ setActiveTab }) {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    location: keralaDistricts[0], // Default to the first district
    farmSize: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', formData);
      alert('Registration successful! Please log in.');
      setActiveTab('login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  }

  return (
    <form onSubmit={handleRegister} className={styles.form}>
      <h2>Join Krishi Khel</h2>
      <input type="text" name="name" onChange={handleChange} placeholder="Full Name" required />
      <input type="tel" name="phone" onChange={handleChange} placeholder="Phone Number" required />
      <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
      <select name="location" value={formData.location} onChange={handleChange} required>
        <option value="" disabled>-- Select Your District --</option>
        {keralaDistricts.map(district => (
          <option key={district} value={district}>{district}</option>
        ))}
      </select>
      <input type="number" name="farmSize" onChange={handleChange} placeholder="Farm Size (in acres)" required min="0.1" step="0.1"/>
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" className="primary-btn">Register</button>
    </form>
  );
}

export default Login;