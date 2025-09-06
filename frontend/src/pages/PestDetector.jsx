import React, { useState } from 'react';
import api from '../services/api';
import styles from './PestDetector.module.css';

function PestDetector() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDiagnose = async () => {
    if (!image) {
      setError('Please select an image first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('plantImage', image);

    try {
      const res = await api.post('/diagnose/pest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Pest & Disease Detector</h1>
      <p>Upload a clear photo of an affected plant leaf to get a diagnosis and a sustainable solution.</p>
      
      <div className={styles.detector}>
        <div className={`card ${styles.uploadCard}`}>
          <h3>1. Upload Image</h3>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {preview && <img src={preview} alt="Preview" className={styles.preview} />}
          <button onClick={handleDiagnose} disabled={loading || !image} className="primary-btn">
            {loading ? 'Diagnosing...' : 'Diagnose Plant'}
          </button>
        </div>
        <div className={`card ${styles.resultCard}`}>
          <h3>2. Diagnosis & Solution</h3>
          {loading && <p>Analyzing with AI, please wait...</p>}
          {error && <p className={styles.error}>{error}</p>}
          {result && (
            <div className={styles.result}>
              <p><strong>Disease Detected:</strong> {result.disease}</p>
              <p><strong>Confidence:</strong> {result.confidence}</p>
              <h4 className={styles.solutionTitle}>🌿 Recommended Organic Solution:</h4>
              <p className={styles.solutionText}>{result.solution}</p>
            </div>
          )}
          {!loading && !result && <p>Your results will appear here.</p>}
        </div>
      </div>
    </div>
  );
}

export default PestDetector;