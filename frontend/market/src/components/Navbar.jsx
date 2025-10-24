import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 text-white">
      <h1 className="w-full text-3xl font-bold text-[#E0B0FF]">MARKETPLACE</h1>

      <ul className="hidden md:flex">
        <li
          className="p-4 hover:text-[#E0B0FF] transition duration = 300"
          onClick={() => navigate("/")}
        >
          Home
        </li>
        <li
          className="p-4 hover:text-[#E0B0FF] transition duration = 300"
          onClick={() => navigate("/login")}
        >
          Login
        </li>
        <li className="p-4 hover:text-[#E0B0FF] transition duration = 300"
            onClick={() => navigate("/buy")}>Buy</li>
        <li className="p-4 hover:text-[#E0B0FF] transition duration = 300"
            onClick={() => navigate("/sell")}>Sell</li>
      </ul>

      <div onClick={handleNav} className="block md:hidden">
        {!nav ? <AiOutlineMenu size={20} /> : <AiOutlineClose size={20} />}
      </div>

      {/* Mobile menu */}
      <div
        className={
          !nav
            ? "fixed left-[-100%] ease-in-out duration-700"
            : "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000300] ease-in-out duration-500"
        }
      >
        <h1 className="w-full text-3xl font-bold text-[#E0B0FF] m-4">MARKETPLACE</h1>
        <ul className="uppercase p-4">
          <li className="p-4 border-b border-gray-600 hover:text-[#E0B0FF] transition duration = 300"
            onClick={() => {navigate("/"); handleNav(); }}>Home</li>
          <li className="p-4 border-b border-gray-600 hover:text-[#E0B0FF] transition duration = 300"
            onClick={() => {navigate("/login"); handleNav(); }}>Login</li>
          <li className="p-4 border-b border-gray-600 hover:text-[#E0B0FF] transition duration = 300"
            onClick={() => {navigate("/buy"); handleNav(); }}>Buy</li>
          <li className="p-4 hover:text-[#E0B0FF] transition duration = 300"
            onClick={() => {navigate("/sell"); handleNav(); }}>Sell</li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
