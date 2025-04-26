// login page 
"use client";
import React from "react";
import Image from "next/image";
import {useState} from "react";
import {redirect} from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';
import '../login.css';


export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

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

return (
    <div className="main">
        <div className="flex items-center flex-col narrow max-w-[450px] text-center mb-4">
            <h1 className="header">LingoBuddy</h1>
            <p className="sub-header">Your AI-Powered Language Learner</p>
        </div>
        <div className="login-container">
            <h1 className="login-header">Login</h1>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>  
                <input type="text" name="email" placeholder="joebruin@ucla.edu" className="p-2 border rounded bg-white" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" name="password" placeholder="Password" className="p-2 border rounded bg-white" onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" className="login-submit">Login</button>
            </form>
            <div className="flex items-center flex-col sm:flex-row justify-center mt-2">
            <a
                className="create-account"
                href="/register"
            >
                Create an account
            </a>
        </div>
        </div>
    </div>
);

}