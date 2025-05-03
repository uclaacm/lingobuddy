'use client'

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { supabase } from '../../lib/supabaseClient';
import './styles.css';
import Typewriter from 'typewriter-effect';

export default function Home() {

  if (typeof window !== 'undefined' && sessionStorage.getItem("email") === null) {
    redirect("/login");
  }

  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const languages = [
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "Norwegian", flag: "🇳🇴" },
    { name: "Mandarin", flag: "🇨🇳" },
  ]

  const lessons = ["1: Alphabet", "2: Greetings", "3: Ordering at a restaurant"];


  async function handleGoClick () {
    const languageSlug = selectedLanguage.toLowerCase();
    const lessonSlug = selectedLesson.toLowerCase();
    let email = sessionStorage.getItem("email");
    if (!email) {
      redirect("/login");
    }
    const {data, error} = await supabase
                .from('profiles')
                .update({language_1: selectedLanguage, language_1_level: selectedLesson})
                .eq('email', email);
    if (error) {
      console.error('Error updating profile:', error);
      return;
    }
    router.push(`lessons/${languageSlug}/${lessonSlug}`);
  }
  return (
    <div className="container-homepage">
      <div className="middle-section-homepage">
        <div className="title-homepage">
        <h1>
            <Typewriter
              options={{
                strings: ["Pick a language and lesson to get started"],
                autoStart: true,
                loop: true,
                delay: 60,
                pauseFor: 999999999,
                cursor: ""
              }}
            />
          </h1>
        </div>


        {/* Language Selection */}
        <div className="language-selection">
          {languages.map((language) => (
            <button
              key={language.name}
              onClick={() => setSelectedLanguage(language.name)}
              className={`language-button ${selectedLanguage === language.name ? "selected" : ""}`}
            >
              <span className="button-text">{language.flag} {language.name}</span>
            </button>
          ))}
        </div>

        {/* Lesson Selection */}
        <div className="lesson-selection">
          {lessons.map((lesson) => (
            <button
              key={lesson}
              onClick={() => setSelectedLesson(lesson)}
              className={`lesson-button ${selectedLesson === lesson ? "selected" : ""}`}
            >
              <span className="button-text">{lesson}</span>
            </button>
          ))}
        </div>

        {/* Go Button */}
        <button
          disabled={!selectedLanguage || !selectedLesson}
          className={`go-button ${selectedLanguage && selectedLesson ? "enabled" : "disabled"}`}
          onClick={handleGoClick}
        >
          Go!
        </button>
      </div>

      <footer className="footer-text">
        <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
        <p>Los Angeles, California · 2025</p>
      </footer>
    </div>
  );
}