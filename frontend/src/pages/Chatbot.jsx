import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import styles from './Chatbot.module.css';

function Chatbot() {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hello! I am Krishi Mitra, your personal farming assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/query', { message: input });
      const aiMessage = { from: 'ai', text: res.data.reply };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      let errorMessageText = 'Sorry, I am having trouble connecting right now. Please try again later.';
      if (error.response?.status === 429) {
        errorMessageText = "I'm getting a lot of questions right now! Please wait a minute before asking again.";
      }
      const errorMessage = { from: 'ai', text: errorMessageText };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatbotPage}>
      <div className={styles.chatWindow}>
        <div className={styles.header}>
          <h3>🤖 Krishi Mitra AI</h3>
        </div>
        <div className={styles.messageArea}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.from]}`}>
              <div className={styles.bubble}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.ai}`}>
              <div className={styles.bubble}>
                <span className={styles.typingIndicator}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className={styles.inputArea}>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crops, missions, or problems..."
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="primary-btn">Send</button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;