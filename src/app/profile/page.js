'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';


export default function Profile() { 

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [languages, setLanguages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('');
    
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
            setLanguages([data.language_1, data.language_2, data.language_3]);
            setLoading(false);
        };
        fetchProfileData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
        <p>Welcome, {username}!</p>
        <h2>Languages</h2>
        <div>
            {languages.map((language, index) => (
                <button key={index} className="language-button" onClick={() => setSelectedLanguage(language)}>
                    {language}
                </button>
            ))}
        </div>
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

async function getProfileData(user) {
    const { data, error } = await supabase
        .from('profiles')
        .select('username, language_1, language_2, language_3')
        .eq('user_id', user.user_id)
        .single();

    if (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
    return data;
}