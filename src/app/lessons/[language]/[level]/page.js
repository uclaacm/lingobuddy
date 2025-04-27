'use client';

import { useParams } from 'next/navigation';
import '../../../learnpage.css';
import './lesson.css';
import { useEffect, useState } from 'react';
import { generateLesson, getLessonSuggestions, chat as chatGemini } from '@/lib/gemini';
import RotatingButton from '@/app/lessons/[language]/[level]/coolButton';

export default function LearnPage() {
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

  // Load lesson suggestions only
  useEffect(() => {
    async function loadSuggestions() {
      setLoading(true);
      setError(null);
      try {
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

  // Handle topic selection and load lesson
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

  // Chat handler
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

  return (
    <div className='container'>
      <RotatingButton />
      {/* Simple Chat UI */}
      <div style={{ maxWidth: 500, margin: '2rem auto' }}>
        <h2>Chat with Gemini</h2>
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
          {chatLoading && <div>Gemini is typing...</div>}
          {chatResponse && <div><b>Gemini:</b> {chatResponse}</div>}
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
              {lesson.vocabulary.map((item, index) => (
                <div key={index} className='vocabulary-card'>
                  <div>{item.chinese || item.spanish || item.french || item.italian || item.norwegian || item.cantonese}</div>
                  <div>{item.pinyin || item.pronunciation || ''}</div>
                  <div>{item.english}</div>
                </div>
              ))}
            </div>
          </section>
          <section className='sentences-section'>
            <h3>Example Sentences</h3>
            {lesson.sentences.map((sentence, index) => (
              <div key={index} className='sentence-card'>
                <div>{sentence.chinese || sentence.spanish || sentence.french || sentence.italian || sentence.norwegian || sentence.cantonese}</div>
                <div>{sentence.pinyin || sentence.pronunciation || ''}</div>
                <div>{sentence.english}</div>
              </div>
            ))}
          </section>
          <section className='cultural-notes'>
            <h3>Cultural Notes</h3>
            <ul>
              {lesson.culturalNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </section>
          <section className='exercises'>
            <h3>Practice Exercises</h3>
            <ol>
              {lesson.exercises.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </div>
  );
}