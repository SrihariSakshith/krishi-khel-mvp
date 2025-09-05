import React from 'react';

const VoiceSpeaker = ({ textToSpeak }) => {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  return (
    <span onClick={handleSpeak} style={{ cursor: 'pointer', marginLeft: '8px' }} title="Read aloud">
      🔊
    </span>
  );
};

export default VoiceSpeaker;