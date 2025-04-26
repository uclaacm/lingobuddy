// login page 
"use client";
import React from "react";
import Image from "next/image";
import {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';
import '../homepage.css';


export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [firstLine, setFirstLine] = useState(""); // State for the first line
    const [secondLine, setSecondLine] = useState(""); // State for the second line

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        if (data.email !== "" && data.password !== "") {
            handleLogin(data.email, data.password).then((data) => {
                console.log(data)
                redirect("/"); 
            }
            ).catch((error) => {
                if (error.message === "Invalid login credentials") {
                    alert("Invalid email or password.");
                }
                else if (error.message === "Email not confirmed") {
                    alert("Please confirm your email address.");
                }
                else if (error.message === "NEXT_REDIRECT"){
                    // if authenticated and if user has selected a language, redirect to profile page
                    redirect("/");
                }
            });
        }
        else if (data.email === "") {
            alert("Please enter an email address.");
        }
        else if (data.password === "") {
            alert("Please enter a password.");
        }

    }

    async function handleLogin(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      
        if (error) throw error;
        return data;
      }

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

return (
    <div className="container-login">
        <div className="middle-section">
        <div className="title">
          <h1>{firstLine}</h1>
          <h1>{secondLine}</h1>
        </div>
        <div className="login-card">
            <h1 className="login-card-headline">Login</h1>
            <form className="login-form" onSubmit={handleSubmit}>  
                <input type="text" name="email" placeholder="joebruin@ucla.edu" className="input-style" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" name="password" placeholder="Password" className="input-style" onChange={(e) => setPassword(e.target.value)} />
                <button
                    disabled={!email || !password}
                    className={`login-button ${email && password ? "enabled" : "disabled"}`}
                    type="submit"
                    >
                    Login
                </button>
            </form>
            <div className="flex items-center flex-col sm:flex-row justify-center mt-2">
                <p>New to LingoBuddy?&nbsp;
                <a
                    style={{ color: '#193c4d' }} 
                    href="/register"
                >
                    Sign Up
                </a>
                </p>
            </div>
        </div>
        </div>
        <footer className="footer-text">
        <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
        </footer>
    </div>
);

}