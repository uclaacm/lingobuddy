// src/lib/speechRecognition.js

export function startSpeechRecognition(onResult, onEnd) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return null;
    }
  
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // You can dynamically set this based on the lesson language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
  
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
  
    recognition.onend = () => {
      if (onEnd) onEnd();
    };
  
    recognition.start();
    return recognition;
  }
  