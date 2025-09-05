import React, { useState, useEffect } from 'react';
import api from '../services/api';
import styles from './Groups.module.css';

const API_URL = 'http://localhost:5000'; 

function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/groups').then(res => {
      setGroups(res.data);
      if (res.data.length > 0) {
        handleSelectGroup(res.data[0]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setLoading(true);
    api.get(`/groups/${group.id}/posts`).then(res => {
      setPosts(res.data);
    }).finally(() => setLoading(false));
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }
    
    try {
      await api.post(`/groups/${selectedGroup.id}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewPostContent('');
      setNewPostImage(null);
      document.getElementById('image-input').value = null; // Clear file input
      handleSelectGroup(selectedGroup);
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  return (
    <div className={styles.groupsPage}>
      <div className={styles.groupList}>
        <h3>Community Groups</h3>
        {groups.map(group => (
          <button 
            key={group.id} 
            onClick={() => handleSelectGroup(group)}
            className={selectedGroup?.id === group.id ? styles.activeGroup : ''}
          >
            {group.name}
          </button>
        ))}
      </div>
      <div className={styles.feed}>
        {selectedGroup && <h2>{selectedGroup.name} Feed</h2>}
        <div className={`card ${styles.postForm}`}>
          <form onSubmit={handlePostSubmit}>
            <textarea 
              value={newPostContent} 
              onChange={e => setNewPostContent(e.target.value)} 
              placeholder="Share an update or ask a question..."
              rows="3"
            ></textarea>
            <div className={styles.formActions}>
              <input type="file" id="image-input" onChange={e => setNewPostImage(e.target.files[0])} />
              <button type="submit" className="primary-btn">Post</button>
            </div>
          </form>
        </div>

        {loading ? <p>Loading posts...</p> : (
          posts.map(post => (
            <div key={post.id} className="card">
              <div className={styles.postHeader}>
                <div className={styles.authorInfo}>
                  <div className={styles.avatar}>{post.author.name.charAt(0)}</div>
                  <div>
                    <p className={styles.authorName}>{post.author.name}</p>
                    <p className={styles.timestamp}>{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <p className={styles.postContent}>{post.content}</p>
              {post.imageUrl && <img src={`${API_URL}${post.imageUrl}`} alt="post attachment" className={styles.postImage} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Groups;