import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


const LoginPage = () => {
  const navigate = useNavigate();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in when page loads
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch("http://localhost:5001/auth/me", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        
        if (data.user) {
          setAlreadyLoggedIn(true);
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Error checking auth status:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
   
    try {
      const res = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Login failed:", data);
        setError(data?.message || data?.error || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      // Success: show message and redirect
      console.log("Login success:", data);
      setSuccessMessage("Login successful! Redirecting...");
      setLoading(false);
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (err) {
      console.error("Network error:", err);
      setError(err?.message || "Network error");
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#000328] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E0B0FF]"></div>
      </div>
    );
  }

  // Show "already logged in" message if user is authenticated
  if (alreadyLoggedIn && currentUser) {
    return (
      <div className="min-h-screen bg-[#000328] text-white flex flex-col items-center justify-center">
        <div className="bg-[#0a0e35] p-8 rounded-xl border border-[#E0B0FF]/30 text-center max-w-md">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-2xl font-bold mb-4 text-[#E0B0FF]">Already Logged In</h1>
          <p className="text-white/80 mb-6">
            You are currently logged in as <span className="text-[#E0B0FF] font-semibold">{currentUser.username}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="bg-[#E0B0FF] text-[#000328] px-6 py-2 rounded-lg font-semibold hover:bg-[#E0B0FF]/80 transition"
            >
              Go to Home
            </button>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#1a1d4d] text-[#E0B0FF] px-6 py-2 rounded-lg font-semibold border border-[#E0B0FF]/30 hover:bg-[#252965] transition"
            >
              Browse Products
            </button>
            <button
              onClick={async () => {
                await fetch("http://localhost:5001/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                setAlreadyLoggedIn(false);
                setCurrentUser(null);
              }}
              className="text-[#E0B0FF]/70 hover:text-[#E0B0FF] underline text-sm mt-2"
            >
              Log out and switch accounts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000328] text-white flex flex-col items-center justify-start mt-20">
      <h1 className="text-4xl font-bold mb-8">Log In</h1>
      <form onSubmit = {handleSubmit}>
         {error && (
            <p role= "alert" aria-live="polite" className="text-red-400 bg-red-900/20 px-3 py-2 rounded mb-4">
              Your username or password is incorrect. Please try again.
            </p>
        )}
        {successMessage && (
            <p role="status" aria-live="polite" className="text-green-400 bg-green-900/20 px-3 py-2 rounded mb-4">
              {successMessage}
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
        <button type = "submit" 
        className='bg-[#E0B0FF] w-[243px] rounded-md
                   font-medium my-6 mx-auto py-2 justify-center text-black 
                 hover:text-[#E0B0FF] hover:bg-transparent 
                   border-2 border-transparent hover:border-[#E0B0FF] px-8 transition duration-300'>
                   Log In</button>
      </form>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="font-semibold">New to NYU Marketplace?</span>
        <Link to="/register" className="text-[#E0B0FF] hover:underline ml-2"> Create an account </Link>
      </div>
    </div>
    
  );
};

export default LoginPage;
