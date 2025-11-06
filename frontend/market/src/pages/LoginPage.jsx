import React, { useState } from "react";
// import { Link } from "react-router-dom";

const LoginPage = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    // This is where you will connect it to the backend!!
    try {
      // send credentials to backend auth endpoint
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST", // HTTP verb
        headers: { "Content-Type": "application/json" }, // we're sending JSON
        credentials: "include",
        body: JSON.stringify({ username, password }), // make the form state JSON
      });

      const data = await res.json(); // parse JSON response body

      if (!res.ok) {
        console.error("Login failed:", data);
        return;
      }

      // success: server responded 200
      console.log("Login success:", data);
      // TODO: redirect, update app auth state, or store token depending on your auth strategy
    } catch (err) {
      // network or parsing error
      console.error("Network error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start mt-20">
      <form onSubmit = {handleSubmit}>
        <div >
          <label htmlFor="username" className = "font-bold">Username:</label>
          <p><input 
            id = "username" 
            type = "text"
            name = "username"
            value = {username}
            onChange = {((e) => setUsername(e.target.value))}
            placeholder = "Enter your username"
            className = 'font-bold rounded-lg px-4 py-2 mb-4 focus: border-yellow-500 border-w-5 text-black'
            /></p>
        </div>
        <div>
          <label htmlFor="password" className = "font-bold">Password:</label>
          <p><input
            id = "password"
            type = "password"
            name = "password"
             value = {password}
            onChange = {((e) => setPassword(e.target.value))}
            placeholder="Enter your password"
            className = "font-bold rounded-lg px-4 py-2 mb-4 focus: border-yellow-500 border-w-5 text-black"
            /></p>
        </div>
        <button type = "submit" 
        className='bg-[#E0B0FF] w-[200px] rounded-md
                   font-medium my-6 mx-auto py-2 text-black 
                 hover:text-[#E0B0FF] hover:bg-transparent 
                   border-2 border-transparent hover:border-[#E0B0FF] px-8 transition duration-300'>
                   Log In</button>
      </form>
    </div>
    
  );
};

export default LoginPage;
