'use client';

import { useParams } from 'next/navigation';
import '../../../learnpage.css';
import './lesson.css';
import { useEffect, useState } from 'react';
import { generateLesson, getLessonSuggestions, chat as chatGemini } from '@/lib/gemini';

export default function LearnPage() {
  const params = useParams();
  const { language, level } = params;
  const [lesson, setLesson] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Load lesson suggestions and first lesson
  useEffect(() => {
    async function loadLesson() {      setLoading(true);
      setError(null);
      try {
        const topics = await getLessonSuggestions(language, level);
        setSuggestions(topics);
        const lesson = await generateLesson(language, level, suggestions);
        setLesson(lesson);
      } catch (err) {
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [language, level]);

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
      {/* Lesson content */}
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