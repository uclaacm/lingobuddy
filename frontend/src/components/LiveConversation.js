import { useState, useRef } from 'react';
// Assuming styling will be handled elsewhere or added later
// import './App.css'; // Removed this line

function LiveConversation() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return null;

    return new Promise(resolve => {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        audioChunksRef.current = [];
        resolve(audioBlob);
      };
       if (mediaRecorderRef.current.state === 'recording') {
           mediaRecorderRef.current.stop();
       } else {
           resolve(null);
       }
    });
  };

  const handleToggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
    } else {
      setIsProcessing(true);
      const audioBlob = await stopRecording();
      setIsRecording(false);

      if (audioBlob) {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseAudioBlob = await response.blob();
             if (responseAudioBlob.size > 0) {
                 const audioUrl = URL.createObjectURL(responseAudioBlob);
                 const audio = new Audio(audioUrl);
                 await audio.play();
             } else {
                 console.log("Received empty audio response.");
             }

          } catch (error) {
            console.error('Error processing audio:', error);
            // Optionally: provide user feedback
          } finally {
            setIsProcessing(false);
          }
      } else {
           console.log("No audio blob captured."); // Handle case where stopRecording resolved null
           setIsProcessing(false); // Ensure processing state is reset
      }
    }
  };

  return (
    <div className="live-conversation-container" style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Live Conversation Practice</h3>
        <p>Record yourself speaking and get feedback.</p>
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing}
           // Basic styling, can be replaced with CSS classes
           style={{
               padding: '10px 20px',
               fontSize: '16px',
               cursor: isProcessing ? 'not-allowed' : 'pointer',
               backgroundColor: isRecording ? '#f44336' : '#4CAF50', // Red when recording, Green otherwise
               color: 'white',
               border: 'none',
               borderRadius: '5px',
               opacity: isProcessing ? 0.6 : 1,
           }}
          // Consider adding classes for better styling management:
          // className={`record-button ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
        >
          {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        {/* Add area for feedback/response if needed */}
    </div>
  );
}

export default LiveConversation;
