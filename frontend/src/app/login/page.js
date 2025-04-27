// login page 
"use client";
import React from "react";
import Image from "next/image";
import {useState, useEffect} from "react";
import {redirect} from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';
import '../homepage.css';
import Typewriter from 'typewriter-effect';


export default function Login() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSecondTypewriter, setShowSecondTypewriter] = useState(false);
    const [card, setCard] = useState("Log in");

    const handleSubmit = (e) => {
      if (card === "Log in") {
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
                    sessionStorage.setItem("email", data.email);
                    redirect("/profile");
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
    else if (card === "Sign Up") {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        if (data.username !== "" && data.password !== "" && data["confirm-password"] !== "" && data.email !== "") {
            // put registration logic here
            // for now, just redirect to login page
            if (data.password !== data["confirm-password"]) {
                alert("Passwords do not match.");
            }
            else {
                handleRegister(data.email, data.password, data.username).then(() => {
                    redirect("/login"); 
                }).catch((error) => {
                    if (error.message === "NEXT_REDIRECT"){
                        setCard("Log in");
                    }
                    else{
                        alert(error.message);
                    }
                });
            }
        }
        else if (data.username === "") {
            alert("Please enter a username.");
        }
        else if (data.password === "") {
            alert("Please enter a password.");
        }
        else if (data["confirm-password"] === "") {
            alert("Please confirm your password.");
        }
        else if (data.email === "") {
            alert("Please enter an email address.");
        }
        else {
            alert("Invalid username or password.");
        }
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

    async function handleRegister(email, password, username) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
      
        if (error) throw error;

        const { user, error: userError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            username: username,
            email: email,
        })

        if (userError) throw userError;
        return data;
      }

  return (
    <div className="container-login">
      <div className="middle-section">
        <div className="title">
          {/* First Typewriter */}
          <Typewriter
            options={{
              autoStart: true,
              loop: false, // Ensure it runs only once
              delay: 60, // Adjust typing speed here
              cursor: "", // Remove cursor after typing
            }}
            onInit={(typewriter) => {
              typewriter
                .typeString("Welcome to LingoBuddy")
                .callFunction(() => setShowSecondTypewriter(true)) // Trigger the second Typewriter
                .start();
            }}
          />

          {/* Second Typewriter */}
          {showSecondTypewriter && (
            <Typewriter
              options={{
                autoStart: true,
                loop: false, // Ensure it runs only once
                delay: 60, // Adjust typing speed here
                cursor: "", // Remove cursor after typing
              }}
              onInit={(typewriter) => {
                typewriter.typeString("–  Your AI-Powered Language Learner").start();
              }}
            />
          )}
        </div>

        <div className="login-card">
            <h1 className="login-card-headline">{card}</h1>
            <form className="login-form" onSubmit={handleSubmit}>
                {card === "Sign Up" && (
                <input type="text" name="username" placeholder="Username" className="input-style" onChange={(e) => setUsername(e.target.value)} />
                )}
                <input type="text" name="email" placeholder="joebruin@ucla.edu" className="input-style" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" name="password" placeholder="Password" className="input-style" onChange={(e) => setPassword(e.target.value)} />
                {card === "Sign Up" && (
                <input type="password" name="confirm-password" placeholder="Confirm Password" className="input-style" onChange={(e) => setConfirmPassword(e.target.value)} />
                )}
                <button
                    disabled={!email || !password}
                    className={`login-button ${email && password ? "enabled" : "disabled"}`}
                    type="submit"
                    >
                    {card}
                </button>
            </form>
            <div className="flex items-center flex-col sm:flex-row justify-center mt-2">
              {card === "Log in" ? (
                <p>New to LingoBuddy?&nbsp;
                <a
                    style={{ color: '#4d8c9d', cursor: 'pointer' }} 
                    onClick={() => setCard("Sign Up")}
                >
                    Sign Up
                </a>
                </p>) : (
                <p>Already have an account?&nbsp;
                <a
                    style={{ color: '#4d8c9d', cursor: 'pointer' }} 
                    onClick={() => setCard("Log in")}
                >
                    Log in
                </a>
                </p>)}
            </div>
        </div>
        </div>
        <footer className="footer-text">
          <p>Made with 💙💛 by Jeff, Lorelei, Hannah, and Sebastian</p>
        </footer>
    </div>
);

}