'use client';

import { useParams, redirect } from 'next/navigation';
import '../../../learnpage.css';
import './lesson.css';
import { useEffect, useState, useRef } from 'react';
import { generateLesson, getLessonSuggestions, chat as chatGemini } from '@/lib/gemini';
import RotatingButton from '@/app/lessons/[language]/[level]/coolButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LiveConversation from '../../../../components/LiveConversation'; 

export default function LearnPage() {

  if (typeof window !== 'undefined' && sessionStorage.getItem("email") === null) {
    redirect("/login");
  }

  const params = useParams();
  const { language, level } = params;
  const [lesson, setLesson] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopics, setShowTopics] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-US';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;

      recognitionInstance.onstart = () => {
        console.log("Listening...");
        setListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);
        setChatInput(transcript);
        handleChatSend({ preventDefault: () => {} });
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended.");
        setListening(false);
      };
    } else {
      console.error('Speech recognition not supported by this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    async function loadSuggestions() {
      setLoading(true);
      setError(null);
      try {
        const prompt = 'Suggest 6 real worlds topics (2-4 words each) for ${language} language lessons at ${level} level. Only return a JSON array of short topic names, no descriptions, with english definitions next to it preceded by a colon';
        const topics = await getLessonSuggestions(language, level);
        setSuggestions(topics);
      } catch (err) {
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    }
    loadSuggestions();
  }, [language, level]);

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    try {
      const lesson = await generateLesson(language, level, topic);
      setLesson(lesson);
    } catch {
      setError('Failed to load lesson');
    }
    setLoading(false);
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatResponse('');
    try {
      const reply = await chatGemini(chatInput);
      setChatResponse(reply);
    } catch {
      setChatResponse('Error getting response.');
    }
    setChatLoading(false);
  };

  const handleSpeak = async (text) => {
    try {
      const response = await fetch('http://localhost:8000/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioData = await response.arrayBuffer();

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

      const decodedAudio = await new Promise((resolve, reject) => {
        audioContext.decodeAudioData(audioData, resolve, reject);
      });

      const source = audioContext.createBufferSource();
      source.buffer = decodedAudio;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error playing speech:', error);
    }
  };

  const handleSpeechRecognition = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    recognition.lang = language === "french" ? "fr-FR"
      : language === "spanish" ? "es-ES"
      : language === "norwegian" ? "nb-NO"
      : language === "mandarin" ? "zh-CN"
      : "en-US";

    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
  };

  return (
    <div className='container'>
        <button className="profile-button" onClick={() => {
          redirect("/profile");
        }
      }>Profile</button>
      <RotatingButton onMicClick={handleSpeechRecognition} />
      <div style={{ maxWidth: 700, margin: '2rem auto' }}>
        <h2>Chat with Lingo</h2>
        <form onSubmit={handleChatSend} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={`Type your message in ${language.charAt(0).toUpperCase() + language.slice(1)}...`}
            style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button type='submit' disabled={chatLoading || !chatInput.trim()}>Send</button>
        </form>
        <div style={{ minHeight: 40 }}>
          {chatLoading && <div>Lingo is thinking...</div>}
          {chatResponse && (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {`**Lingo:** ${chatResponse}`}
                            </ReactMarkdown>
                            )}
        </div>
      </div>
      {/* Topic suggestions */}
      {suggestions.length > 0 && (
        <div className="topic-selector">
          <button 
            onClick={() => setShowTopics(!showTopics)}
            style={{ 
              padding: '10px 20px', 
              fontSize: '1.2rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            {showTopics ? 'Hide Topics' : 'Choose a Topic'}
          </button>
          {showTopics && (
            <div className="topic-buttons">
              {suggestions.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleTopicSelect(topic)}
                  className={`topic-button${selectedTopic === topic ? ' selected' : ''}`}
                  style={{ margin: '0 8px 8px 0', padding: '8px 16px', borderRadius: '5px', border: '1px solid #3498db', background: selectedTopic === topic ? '#3498db' : '#fff', color: selectedTopic === topic ? '#fff' : '#3498db', cursor: 'pointer' }}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Lesson content */}
      {!lesson && !loading && !error && (
        <div style={{ textAlign: 'center', margin: '2rem' }}>
          <p>Select a topic above to start learning!</p>
        </div>
      )}
      {loading ? (
        <div className='loading'>Loading lesson...</div>
      ) : error ? (
        <div className='error'>{error}</div>
      ) : lesson ? (
        <div className='lesson-content'>
          <h1 className='title'>{language.charAt(0).toUpperCase() + language.slice(1)} {level.charAt(0).toUpperCase() + level.slice(1)} Lesson</h1>
          <h2>{lesson.title}</h2>
          <section className='vocabulary-section'>
            <h3>Vocabulary</h3>
            <div className='vocabulary-grid'>
              {Array.isArray(lesson.vocabulary) && lesson.vocabulary.length > 0 ? (
                lesson.vocabulary.map((item, index) => (
                  <div key={index} className='vocabulary-card'>
                    <div>
                      {item.chinese || item.spanish || item.french || item.italian || item.norwegian || item.cantonese}
                      <button
                        onClick={() => {
                          setSpeakingIndex(index);
                          handleSpeak(item.chinese || item.spanish || item.french || item.italian || item.norwegian || item.cantonese)
                            .finally(() => setSpeakingIndex(null));
                        }}
                        disabled={speakingIndex == index}
                        style={{ marginLeft: '8px' }}
                      >
                        {speakingIndex === index ? "🔄 Loading Lingo..." : "🔊"}
                      </button>
                    </div>
                    <div>{item.pinyin || item.pronunciation || ''}</div>
                    <div>{item.english}</div>
                  </div>
                ))
              ) : (
                <p>No vocabulary available for this lesson.</p>
              )}
            </div>
          </section>

          <section className='sentences-section'>
            <h3>Example Sentences</h3>
            {Array.isArray(lesson.sentences) && lesson.sentences.length > 0 ? (
              lesson.sentences.map((sentence, index) => (
                <div key={index} className='sentence-card'>
                  <div>
                    {sentence.chinese || sentence.spanish || sentence.french || sentence.italian || sentence.norwegian || sentence.cantonese}
                    <button
                      onClick={() => {
                        setSpeakingIndex(index);
                        handleSpeak(sentence.chinese || sentence.spanish || sentence.french || sentence.italian || sentence.norwegian || sentence.cantonese)
                          .finally(() => setSpeakingIndex(null));
                      }}
                      disabled={speakingIndex == index}
                      style={{ marginLeft: '8px' }}
                    >
                      {speakingIndex === index ? "🔄 Loading Lingo..." : "🔊"}
                    </button>
                  </div>
                  <div>{sentence.pinyin || sentence.pronunciation || ''}</div>
                  <div>{sentence.english}</div>
                </div>
              ))
            ) : (
              <p>No example sentences available for this lesson.</p>
            )}
          </section>

          <section className='cultural-notes'>
            <h3>Cultural Notes</h3>
            <ul>
              {Array.isArray(lesson.culturalNotes) && lesson.culturalNotes.length > 0 ? (
                lesson.culturalNotes.map((note, index) => (
                  <li key={index}>{note}</li>
                ))
              ) : (
                <p>No cultural notes available for this lesson.</p>
              )}
            </ul>
          </section>

          <section className='exercises'>
            <h3>Practice Exercises</h3>
            <ol>
              {Array.isArray(lesson.exercises) && lesson.exercises.length > 0 ? (
                lesson.exercises.map((exercise, index) => (
                  <li key={index}>{exercise}</li>
                ))
              ) : (
                <p>No exercises available for this lesson.</p>
              )}
            </ol>
          </section>

        </div>
      ) : null}
      <LiveConversation />
    </div>
  );
}