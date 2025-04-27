'use client'

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { supabase } from '../../lib/supabaseClient';
import './homepage.css';
import Typewriter from 'typewriter-effect';

export default function Home() {

  if (typeof window !== 'undefined' && sessionStorage.getItem("email") === null) {
    redirect("/login");
  }

  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  const languages = [
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "Norwegian", flag: "🇳🇴" },
    { name: "Mandarin", flag: "🇨🇳" },
  ]

  const levels = ["Basic", "Intermediate", "Advanced"];


  async function handleGoClick () {
    const languageSlug = selectedLanguage.toLowerCase();
    const levelSlug = selectedLevel.toLowerCase();
    let email = sessionStorage.getItem("email");
    if (!email) {
      redirect("/login");
    }
    const {data, error} = await supabase
                .from('profiles')
                .update({language_1: selectedLanguage, language_1_level: selectedLevel})
                .eq('email', email);
    if (error) {
      console.error('Error updating profile:', error);
      return;
    }
    router.push(`lessons/${languageSlug}/${levelSlug}`);
  }
  return (
    <div className="container-homepage">
      <div className="middle-section">
        <div className="title-homepage">
        <h1>
            <Typewriter
              options={{
                strings: ["Pick a language and level to get started"],
                autoStart: true,
                loop: true,
                delay: 60, // Adjust typing speed here
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

        {/* Level Selection */}
        <div className="level-selection">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`level-button ${selectedLevel === level ? "selected" : ""}`}
            >
              <span className="button-text">{level}</span>
            </button>
          ))}
        </div>

        {/* Go Button */}
        <button
          disabled={!selectedLanguage || !selectedLevel}
          className={`go-button ${selectedLanguage && selectedLevel ? "enabled" : "disabled"}`}
          onClick={handleGoClick}
        >
          Go!
        </button>
      </div>

      <footer className="footer-text">
        <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
      </footer>
    </div>
  );
}