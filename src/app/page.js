'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import './homepage.css';

export default function Home() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [firstLine, setFirstLine] = useState(""); // State for the first line
  const [secondLine, setSecondLine] = useState(""); // State for the second line

  useEffect(() => {
    const firstText = "Weelcome to LingoBuddy 🌍";
    const secondText = "–  Your AI-Powered Language Learner";
    let firstIndex = 0;
    let secondIndex = 0;

    // Typing effect for the first line
    const typeFirstLine = () => {
      if (firstIndex < firstText.length) {
        setFirstLine((prev) => prev + firstText.charAt(firstIndex));
        firstIndex++;
        setTimeout(typeFirstLine, 60); // Adjust typing speed here
      } else {
        // Start typing the second line after the first line is complete
        setTimeout(typeSecondLine, 500); // Delay before starting the second line
      }
    };

    // Typing effect for the second line
    const typeSecondLine = () => {
      if (secondIndex < secondText.length) {
        setSecondLine((prev) => prev + secondText.charAt(secondIndex));
        secondIndex++;
        setTimeout(typeSecondLine, 60); // Adjust typing speed here
      }
    };

    typeFirstLine(); // Start typing the first line
  }, []);

  const languages = [
    { name: "Spanish", flag: "🇪🇸" },
    { name: "French", flag: "🇫🇷" },
    { name: "Italian", flag: "🇮🇹" },
    { name: "Norwegian", flag: "🇳🇴" },
    { name: "Mandarin", flag: "🇨🇳" },
    { name: "Cantonese", flag: "🇭🇰" }
  ]

  const levels = ["Basic", "Intermediate", "Advanced"];


  function handleGoClick () {
    const languageSlug = selectedLanguage.toLowerCase();
    const levelSlug = selectedLevel.toLowerCase();
    router.push(`lessons/${languageSlug}/${levelSlug}`);
  }
  return (
    <div className="container">
      <div className="middle-section">
        <div className="title">
          <h1>{firstLine}</h1>
          <h1>{secondLine}</h1>
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