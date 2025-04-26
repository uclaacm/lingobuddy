// login page 
"use client";
import React from "react";
import Image from "next/image";
import {useState} from "react";
import {redirect} from "next/navigation";
import '../login.css';


export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log(data);
        // replace with your authentication logic (send data to server, check credentials, etc.)
        if (data.username !== "" && data.password !== "") {
            // put registration logic here
            // for now, just redirect to login page
            redirect("/login"); 
        }
        else if (data.username === "") {
            alert("Please enter a username.");
        }
        else if (data.password === "") {
            alert("Please enter a password.");
        }
        else {
            alert("Invalid username or password.");
        }
    }

return (
    <div className="main">
    <div className="flex gap-2 items-center flex-col narrow max-w-[450px] text-center mb-4">
        <h1 className="header">Welcome to your AI Language Learning Buddy!!</h1>
    </div>
    <div className="login-container">
        <h1 className="login-header">Register</h1>
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>  
            <input type="text" name="username" placeholder="Username" className="p-2 border rounded bg-white" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" name="password" placeholder="Password" className="p-2 border rounded bg-white" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="login-submit">Register</button>
        </form>
        <div className="flex items-center flex-col sm:flex-row justify-center mt-2">
        <a
            className="create-account"
            href="/login"
        >
            Create an account
        </a>
    </div>
    </div>
</div>
  );

}