'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { redirect, useRouter } from 'next/navigation';
import '../homepage.css';


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

    return (
    <div className="container-homepage">
      <div className="middle-section">
        <div className="title-homepage">
          <h1>Welcome, {username}!</h1>
        </div>
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
      </div>

      <footer className="footer-text">
        <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
      </footer>
    </div>
    );
}

async function getUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error fetching user session:', error);
        return null;
    }
    return session ? session.user : null;
}

async function addLanguage(language) {
    const {curr_languages, error} = await supabase
        .from('profiles')
        .select('language_1, language_2, language_3')
        .eq('email', sessionStorage.getItem("email"))
        .single();
    if (error) {
        console.error('Error fetching languages:', error);
        return null;
    }
    if (curr_languages.language_1 === null) {
        await supabase
            .from('profiles')
            .update({language_1: language})
            .eq('email', sessionStorage.getItem("email"));
    }
    else if (curr_languages.language_2 === null) {
        await supabase
            .from('profiles')
            .update({language_2: language})
            .eq('email', sessionStorage.getItem("email"));
    }
    else if (curr_languages.language_3 === null) {
        await supabase
            .from('profiles')
            .update({language_3: language})
            .eq('email', sessionStorage.getItem("email"));
    }
    else {
        console.log("All languages are already set.");
    }




}