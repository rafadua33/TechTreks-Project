import React, { useState } from "react";
// import { Link } from "react-router-dom";

const LoginPage = () => {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
   
    // This is where you will connect it to the backend!!

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
