'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { redirect, useRouter } from 'next/navigation';
import '../profile.css';


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
    const [selectedLevel, setSelectedLevel] = useState('');
    const [addLanguage, setAddLanguage] = useState('');

    const levels = ["Basic", "Intermediate", "Advanced"];

    async function handleGoClick () {
        const languageSlug = selectedLanguage.toLowerCase();
        const levelSlug = selectedLevel.toLowerCase();    
        router.push(`lessons/${languageSlug}/${levelSlug}`);
      }
    
    useEffect(() => {
        const fetchProfileData = async () => {
            let email = sessionStorage.getItem("email");
            const { data, error } = await  supabase
                .from('profiles')
                .select('username, language_1, language_2, language_3')
                .eq('email', email)
                .single();
            if (error) {
                console.error('Error fetching profile data:', error);
                return null;
            }
            console.log(data);
            setUsername(data.username);

            let nonnull_languages = [data.language_1, data.language_2, data.language_3].filter(lang => lang !== null);
            if (nonnull_languages.length === 0) {
                redirect("/");
            }


            setLanguages(nonnull_languages);
            setLoading(false);
        };
        fetchProfileData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    console.log("Languages: ", languages);

    return (
      <div className="container-login">
      <div className="middle-section">
        <div className="title-homepage">
          <h1>Welcome, {username}!</h1>
        </div>

        <div className="login-card">
        {/* Language Selection */}
        <div className="language-selection">
          {languages.map((language) => (
            <button
              key={language}
              onClick={() => setSelectedLanguage(language)}
              className={`language-button ${selectedLanguage === language ? "selected" : ""}`}
            >
              <span className="button-text">{language.flag} {language}</span>
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
            className={`add-button enabled`}
            onClick={() => {
              addLanguageYuh(addLanguage);
              setAddLanguage('');
              setLanguages((prevLanguages) => [...prevLanguages, addLanguage]);
            }}
          > Add Language</button>
          </div>

      </div>

      <footer className="footer-text">
        <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
      </footer>
    </div>
    );
}

async function addLanguageYuh(language) {
  let email = sessionStorage.getItem("email");
    const {data, error} = await supabase
        .from('profiles')
        .select('language_1, language_2, language_3, email')
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