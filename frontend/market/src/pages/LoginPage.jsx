import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
   
    try {
      // send credentials to backend auth endpoint
      const res = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login failed:", data);
        setError(data?.error || data?.message || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      // success: redirect to home
      console.log("Login success:", data);
      navigate("/", { replace: true });
    } catch (err) {
      // network or parsing error
      console.error("Network error:", err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start mt-20">
      <h1 className="text-4xl font-bold mb-8">Log In</h1>
      <form onSubmit = {handleSubmit}>
         {error && (
            <p role= "alert" aria-live="polite" className="text-red-400 bg-red-900/20 px-3 py-2 rounded mb-4">
              {error}
            </p>
        )}
        <div >
          <label htmlFor="username" className = "font-bold">Username:</label>
          <p><input 
            id = "username" 
            type = "text"
            name = "username"
            value = {username}
            onChange = {((e) => { setUsername(e.target.value); if (error) setError(null); })}
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
            onChange = {((e) => { setPassword(e.target.value); if (error) setError(null); })}
            placeholder="Enter your password"
            className = "font-bold rounded-lg px-4 py-2 mb-4 focus: border-yellow-500 border-w-5 text-black"
            /></p>
        </div>
        <button 
          type="submit"
          disabled={loading}
          className='bg-[#E0B0FF] w-[243px] rounded-md
                   font-medium my-6 mx-auto py-2 justify-center text-black 
                 hover:text-[#E0B0FF] hover:bg-transparent 
                   border-2 border-transparent hover:border-[#E0B0FF] px-8 transition duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed'>
                   {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="font-semibold">New to NYU Marketplace?</span>
        <Link to="/register" className="text-[#E0B0FF] hover:underline ml-2"> Create an account </Link>
      </div>
    </div>
    
  );
};

export default LoginPage;
