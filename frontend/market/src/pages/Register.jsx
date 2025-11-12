import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
   
    try {
      // Send registration data to backend
      const res = await fetch("http://localhost:5001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // include cookies for session-based auth
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle registration errors
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Registration successful - now log the user in
      const loginRes = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setError("Account created but login failed. Please log in manually.");
        setLoading(false);
        return;
      }

      // Successfully registered and logged in - redirect to home
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start mt-20">
      <h2 className="text-4xl font-bold mb-8">Register</h2>
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
            <label htmlFor="email" className = "font-bold">Email:</label>
            <p><input
                id = "email"
                type = "email"
                name = "email"
                value = {email}
                onChange = {((e) => { setEmail(e.target.value); if (error) setError(null); })}
                placeholder="Enter your email"
                className = "font-bold rounded-lg px-4 py-2 mb-4 focus: border-yellow-500 border-w-5 text-black"
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
                   font-medium my-6 mx-auto py-2 text-black 
                 hover:text-[#E0B0FF] hover:bg-transparent 
                   border-2 border-transparent hover:border-[#E0B0FF] px-8 transition duration-300
                   disabled:opacity-50 disabled:cursor-not-allowed'>
                   {loading ? "Creating..." : "Create"}
        </button>
      </form>
      <div className="flex items-center justify-center gap-2 mt-2">
            <span className="font-semibold">Already have an account?</span>
            <Link to="/login" className="text-[#E0B0FF] hover:underline ml-2"> Log In </Link>
      </div>
    </div>
    
  );
};

export default Register;
