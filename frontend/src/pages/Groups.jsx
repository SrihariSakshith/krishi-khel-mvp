import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import styles from './Groups.module.css';

const API_URL = 'http://localhost:5000'; 
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

function Groups() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = (groupId) => {
    setLoading(true);
    api.get(`/groups/${groupId}/posts`).then(res => {
      setPosts(res.data.map(p => ({...p, showComments: false})));
    }).finally(() => setLoading(false));
  };
  
  useEffect(() => {
    api.get('/groups').then(res => {
      setGroups(res.data);
      if (res.data.length > 0) {
        setSelectedGroup(res.data[0]);
        fetchPosts(res.data[0].id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchPosts(group.id);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert("Post content cannot be empty.");
      return;
    }
    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostImage) formData.append('image', newPostImage);
    
    await api.post(`/groups/${selectedGroup.id}/posts`, formData);
    setNewPostContent('');
    setNewPostImage(null);
    document.getElementById('image-input').value = null;
    fetchPosts(selectedGroup.id);
  };
  
  const toggleComments = (postId) => {
    setPosts(posts.map(p => p.id === postId ? {...p, showComments: !p.showComments} : p));
  }

  return (
    <div className={styles.groupsPage}>
      <div className={styles.groupList}>
        <div className="card">
          <h3>Community Groups</h3>
          {groups.map(group => (
            <button key={group.id} onClick={() => handleSelectGroup(group)} className={`${styles.groupBtn} ${selectedGroup?.id === group.id ? styles.activeGroup : ''}`}>
              {group.name}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.feed}>
        {selectedGroup && <h2>{selectedGroup.name} Feed</h2>}
        <div className={`card ${styles.postForm}`}>
          <form onSubmit={handlePostSubmit}>
            <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="Share an update or ask a question..." rows="3" />
            <div className={styles.formActions}>
              <input type="file" id="image-input" onChange={e => setNewPostImage(e.target.files[0])} />
              <button type="submit" className="primary-btn">Post</button>
            </div>
          </form>
        </div>

        {loading ? <p>Loading posts...</p> : posts.map(post => (
          <PostCard key={post.id} post={post} fetchPosts={() => fetchPosts(selectedGroup.id)} toggleComments={toggleComments} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, fetchPosts, toggleComments }) {
    const userId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).userId;
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            await api.delete(`/posts/${post.id}`);
            fetchPosts();
        }
    }
    const handleEdit = async () => {
        await api.put(`/posts/${post.id}`, { content: editedContent });
        setIsEditing(false);
        fetchPosts();
    }
    const handleReact = async (emoji) => {
        await api.post(`/posts/${post.id}/react`, { emoji });
        fetchPosts();
    }

    return (
        <div className="card">
            <div className={styles.postHeader}>
                <div className={styles.authorInfo}>
                    <div className={styles.avatar}>{post.author.name.charAt(0)}</div>
                    <div>
                        <p className={styles.authorName}>{post.author.name}</p>
                        <p className={styles.timestamp}>{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                {post.authorId === userId && (
                    <div className={styles.postMenu}>
                        <button onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel' : 'Edit'}</button>
                        <button onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <div>
                    <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} className={styles.editArea} />
                    <button onClick={handleEdit} className="primary-btn">Save</button>
                </div>
            ) : (
                <p className={styles.postContent}>{post.content}</p>
            )}
            {post.imageUrl && <img src={`${API_URL}${post.imageUrl}`} alt="post attachment" className={styles.postImage} />}

            <div className={styles.postActions}>
                <div className={styles.emojiBar}>
                    {EMOJIS.map(emoji => <button key={emoji} onClick={() => handleReact(emoji)} className={styles.emojiBtn}>{emoji}</button>)}
                </div>
                <button onClick={() => toggleComments(post.id)} className={styles.commentBtn}>{post.comments.length} Comments</button>
            </div>

            {post.emoji && (
                <div className={styles.reactions}>
                    {Object.entries(post.emoji).map(([emoji, users]) => users.length > 0 && (
                        <span key={emoji} className={styles.reaction}>{emoji} {users.length}</span>
                    ))}
                </div>
            )}
            {post.showComments && <CommentSection postId={post.id} comments={post.comments} fetchPosts={fetchPosts} />}
        </div>
    )
}

function CommentSection({ postId, comments, fetchPosts }) {
    const [newComment, setNewComment] = useState("");
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        await api.post(`/posts/${postId}/comments`, { content: newComment });
        setNewComment("");
        fetchPosts();
    }
    return (
        <div className={styles.commentSection}>
            <hr />
            {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                    <div className={styles.avatar}>{comment.author.name.charAt(0)}</div>
                    <div className={styles.commentBody}>
                        <p className={styles.authorName}>{comment.author.name}</p>
                        <p>{comment.content}</p>
                    </div>
                </div>
            ))}
            <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." />
                <button type="submit">Send</button>
            </form>
        </div>
    )
}

export default Groups;