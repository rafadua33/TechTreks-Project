import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Availability states
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Debounce username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    let active = true;
    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:5001/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          credentials: "include"
        });
        if (!res.ok) {
          throw new Error("check failed");
        }
        const data = await res.json();
        if (active) {
          setUsernameAvailable(data.username_available);
        }
      } catch (err) {
        if (active) setUsernameAvailable(null);
      } finally {
        if (active) setCheckingUsername(false);
      }
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username]);

  // Debounce email check
  // Frontend validation: check if email ends with @nyu.edu AND if it's available
  useEffect(() => {
    if (!email || !email.includes("@")) {
      setEmailAvailable(null);
      return;
    }
    
    // Check for NYU email domain first (client-side validation)
    // This provides immediate feedback before checking backend availability
    if (!email.toLowerCase().endsWith("@nyu.edu")) {
      setEmailAvailable(false); // Mark as unavailable to show error
      setCheckingEmail(false);
      return;
    }
    
    let active = true;
    setCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("http://localhost:5001/auth/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include"
        });
        if (!res.ok) {
          throw new Error("check failed");
        }
        const data = await res.json();
        if (active) {
          setEmailAvailable(data.email_available);
        }
      } catch (err) {
        if (active) setEmailAvailable(null);
      } finally {
        if (active) setCheckingEmail(false);
      }
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [email]);
  
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
    <div className="min-h-screen bg-[#000328] text-white flex flex-col items-center justify-start mt-20">
      <h2 className="text-4xl font-bold mb-8">Register</h2>
      <form onSubmit = {handleSubmit}>
         {error && (
            <p role= "alert" aria-live="polite" className="text-red-400 bg-red-900/20 px-3 py-2 rounded mb-4">
              {error}
            </p>
        )}
        <div >
            <label htmlFor="username" className = "font-bold">Username:</label>
            <div className="relative">
              <input 
                  id = "username" 
                  type = "text"
                  name = "username"
                  value = {username}
                  onChange = {((e) => { 
                    setUsername(e.target.value); 
                    if (error) setError(null);
                    setUsernameAvailable(null);
                  })}
                  placeholder = "Enter your username"
                  className = {`font-bold rounded-lg px-4 py-2 mb-1 focus:border-yellow-500 border-2 text-black w-full ${
                    usernameAvailable === true ? 'border-green-500' : 
                    usernameAvailable === false ? 'border-red-500' : 
                    'border-gray-300'
                  }`}
              />
              {checkingUsername && (
                <span className="absolute right-3 top-2 text-gray-500 text-sm">Checking...</span>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <span className="absolute right-3 top-2 text-green-500 text-xl">✓</span>
              )}
              {!checkingUsername && usernameAvailable === false && (
                <span className="absolute right-3 top-2 text-red-500 text-xl">✗</span>
              )}
            </div>
            {usernameAvailable === false && (
              <p className="text-red-400 text-sm mb-2">Username is already taken</p>
            )}
            {usernameAvailable === true && (
              <p className="text-green-400 text-sm mb-2">Username is available</p>
            )}
        </div>
        <div>
            <label htmlFor="email" className = "font-bold">Email:</label>
            <div className="relative">
              <input
                  id = "email"
                  type = "email"
                  name = "email"
                  value = {email}
                  onChange = {((e) => { 
                    setEmail(e.target.value); 
                    if (error) setError(null);
                    setEmailAvailable(null);
                  })}
                  placeholder="Enter your email"
                  className = {`font-bold rounded-lg px-4 py-2 mb-1 focus:border-yellow-500 border-2 text-black w-full ${
                    emailAvailable === true ? 'border-green-500' : 
                    emailAvailable === false ? 'border-red-500' : 
                    'border-gray-300'
                  }`}
              />
              {checkingEmail && (
                <span className="absolute right-3 top-2 text-gray-500 text-sm">Checking...</span>
              )}
              {!checkingEmail && emailAvailable === true && (
                <span className="absolute right-3 top-2 text-green-500 text-xl">✓</span>
              )}
              {!checkingEmail && emailAvailable === false && (
                <span className="absolute right-3 top-2 text-red-500 text-xl">✗</span>
              )}
            </div>
            {emailAvailable === false && !email.toLowerCase().endsWith("@nyu.edu") && email.includes("@") && (
              <p className="text-red-400 text-sm mb-2">Please use an NYU email (@nyu.edu)</p>
            )}
            {emailAvailable === false && email.toLowerCase().endsWith("@nyu.edu") && (
              <p className="text-red-400 text-sm mb-2">Email is already registered</p>
            )}
            {emailAvailable === true && (
              <p className="text-green-400 text-sm mb-2">Email is available</p>
            )}
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
