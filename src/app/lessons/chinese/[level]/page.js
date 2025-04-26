'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { generateChineseLesson, getLessonSuggestions } from '@/lib/gemini';
import './chinese-lessons.css';

export default function ChineseLessonPage() {
  const params = useParams();
  const { level } = params;
  const [lesson, setLesson] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const topics = await getLessonSuggestions(level);
        setSuggestions(topics);
        if (topics.length > 0) {
          const firstLesson = await generateChineseLesson(level, topics[0]);
          setLesson(firstLesson);
        }
      } catch (err) {
        setError('Failed to load lesson suggestions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSuggestions();
  }, [level]);

  const handleTopicSelect = async (topic) => {
    setLoading(true);
    try {
      const newLesson = await generateChineseLesson(level, topic);
      setLesson(newLesson);
    } catch (err) {
      setError('Failed to generate lesson');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading lesson...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">Chinese {level.charAt(0).toUpperCase() + level.slice(1)} Lessons</h1>
      
      <div className="topic-selector">
        <h2>Choose a Topic</h2>
        <div className="topic-buttons">
          {suggestions.map((topic, index) => (
            <button
              key={index}
              onClick={() => handleTopicSelect(topic)}
              className="topic-button"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {lesson && (
        <div className="lesson-content">
          <h2>{lesson.title}</h2>
          
          <section className="vocabulary-section">
            <h3>Vocabulary</h3>
            <div className="vocabulary-grid">
              {lesson.vocabulary.map((item, index) => (
                <div key={index} className="vocabulary-card">
                  <div className="chinese">{item.chinese}</div>
                  <div className="pinyin">{item.pinyin}</div>
                  <div className="english">{item.english}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="sentences-section">
            <h3>Example Sentences</h3>
            {lesson.sentences.map((sentence, index) => (
              <div key={index} className="sentence-card">
                <div className="chinese">{sentence.chinese}</div>
                <div className="pinyin">{sentence.pinyin}</div>
                <div className="english">{sentence.english}</div>
              </div>
            ))}
          </section>

          <section className="cultural-notes">
            <h3>Cultural Notes</h3>
            <ul>
              {lesson.culturalNotes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="exercises">
            <h3>Practice Exercises</h3>
            <ol>
              {lesson.exercises.map((exercise, index) => (
                <li key={index}>{exercise}</li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
} 