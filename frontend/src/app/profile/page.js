'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { redirect, useRouter } from 'next/navigation';
import '../styles.css';


export default function Profile() { 

    const router = useRouter();

    if (typeof window !== 'undefined' && sessionStorage.getItem("email") === null) {
        redirect("/login");
      }

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedLesson, setSelectedLesson] = useState('');
    const [addLanguage, setAddLanguage] = useState('');

    const lessons = ["1: Alphabet", "2: Greetings", "3: Ordering at a restaurant"];

    async function handleGoClick () {
        const languageSlug = selectedLanguage.toLowerCase();
        const lessonSlug = selectedLesson.toLowerCase();    
        router.push(`lessons/${languageSlug}/${lessonSlug}`);
      }
    
    useEffect(() => {
        const fetchProfileData = async () => {
            let email = sessionStorage.getItem("email");
            const { data, error } = await  supabase
                .from('profiles')
                .select('username, language_1, language_2, language_3, language_4')
                .eq('email', email)
                .single();
            if (error) {
                console.error('Error fetching profile data:', error);
                return null;
            }
            console.log(data);
            setUsername(data.username);

            let nonnull_languages = [data.language_1, data.language_2, data.language_3, data.language_4].filter(lang => lang !== null);
            if (nonnull_languages.length === 0) {
                redirect("/");
            }


            setLanguages(nonnull_languages);
            setLoading(false);
        };
        fetchProfileData();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    console.log("Languages: ", languages);

    return (
      <div className="container-login">
      <div className="middle-section-login">
        <div className="title-homepage">
          <h1>Welcome, {username}!</h1>
        </div>

        <div className="dashboard-card">
        {/* Language Selection */}
        <div className="language-selection">
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => setSelectedLanguage(language)}
              className={`language-button ${selectedLanguage === language ? "selected" : ""}`}
            >
              <span className="button-text">{language}</span>
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

        <div className="add-language">
          <select
            value={addLanguage}
            onChange={(e) => setAddLanguage(e.target.value)}
            className="language-dropdown"
          >
            <option default disabled value="">Add a language</option>
            <option disabled={languages.includes('Spanish')} value="Spanish">Spanish</option>
            <option disabled={languages.includes('French')} value="French">French</option>
            <option disabled={languages.includes('Mandarin')} value="Mandarin">Mandarin</option>
            <option disabled={languages.includes('Norwegian')} value="Norwegian">Norwegian</option>
          </select>
        </div>
        <button
            className={`add-button ${addLanguage ? "enabled" : "disabled"}`}
            onClick={() => {
              if (languages.length >= 4 || addLanguage === '') {
                setAddLanguage('');
              }
              else {
              addLanguageYuh(addLanguage);
              setAddLanguage('');
              setLanguages((prevLanguages) => [...prevLanguages, addLanguage]);
              }
            }}
          > Add Language</button>
          </div>

      </div>

      <footer className="footer-text">
        <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
        <p>Los Angeles, California · 2025</p>
      </footer>
    </div>
    );
}

async function addLanguageYuh(language) {
  let email = sessionStorage.getItem("email");
    const {data, error} = await supabase
        .from('profiles')
        .select('language_1, language_2, language_3, language_4, email')
        .eq('email', email)
        .single();
    if (error) {
        console.error('Error fetching languages:', error);
        return null;
    }
    console.log("Fetched languages: ", data);
    if (data.language_1 === null) {
        await supabase
            .from('profiles')
            .update({language_1: language})
            .eq('email', sessionStorage.getItem("email"));
    }
    else if (data.language_2 === null) {
        await supabase
            .from('profiles')
            .update({language_2: language})
            .eq('email', sessionStorage.getItem("email"));
    }
    else if (data.language_3 === null) {
        await supabase
            .from('profiles')
            .update({language_3: language})
            .eq('email', sessionStorage.getItem("email"));
    }
    else if (data.language_4 === null) {
      await supabase
          .from('profiles')
          .update({language_4: language})
          .eq('email', sessionStorage.getItem("email"));
  }
}