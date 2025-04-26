// register page 
"use client";
import React from "react";
import Image from "next/image";
import {useState} from "react";
import {redirect} from "next/navigation";
import { supabase } from '../../../lib/supabaseClient';
import '../homepage.css';


export default function Register() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        // replace with your authentication logic (send data to server, check credentials, etc.)
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
                        redirect("/login");
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
    <div className="main">
    <div className="flex items-center flex-col narrow max-w-[450px] text-center mb-4">
        <h1 className="header">LingoBuddy</h1>
        <p className="sub-header">Your AI-Powered Language Learner</p>
    </div>
    <div className="login-container">
        <h1 className="login-header">Register</h1>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>  
            <input type="text" name="username" placeholder="Username" className="p-2 border rounded bg-white" onChange={(e) => setUsername(e.target.value)} />
            <input type="text" name="email" placeholder="joebruin@ucla.edu" className="p-2 border rounded bg-white" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" name="password" placeholder="Password" className="p-2 border rounded bg-white" onChange={(e) => setPassword(e.target.value)} />
            <input type="password" name="confirm-password" placeholder="Confirm Password" className="p-2 border rounded bg-white" onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="submit" className="login-submit">Register</button>
        </form>
        <div className="flex items-center flex-col sm:flex-row justify-center mt-2">
        <a
            className="create-account"
            href="/login"
        >
            Login
        </a>
    </div>
    </div>
</div>
  );

}