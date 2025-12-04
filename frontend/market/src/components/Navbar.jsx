import React, { useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const handleNav = () => setNav(!nav);

  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname || "/";

  // helper to render nav items
  const NavItem = ({ to, children }) => {
    const isActive = current === to;
    return (
      <li
        onClick={() => navigate(to)}
        className={
          `p-4 transition duration-300 cursor-pointer hover:text-[#E0B0FF] ` +
          (isActive ? "text-[#E0B0FF]" : "text-white")
        }
      >
        {children}
      </li>
    );
  };

  return (
    <div className="relative z-50 flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4 font-darker-grotesque font-bold text-2xl text-white">
      <img
        src={"/images/top.png"}
        alt="Top"
        className="h-8 md:h-10 w-auto transform transition duration-200 ease-in-out hover:scale-105 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <ul className="hidden md:flex">
        <NavItem to="/">Home</NavItem>
        <NavItem to="/login">Login</NavItem>
        <NavItem to="/products">Products</NavItem>
      </ul>

      <div onClick={handleNav} className="block md:hidden">
        {!nav ? <AiOutlineMenu size={20} /> : <AiOutlineClose size={20} />}
      </div>

      {/* Mobile menu */}
      <div
        className={
          !nav
            ? "fixed left-[-100%] ease-in-out duration-700"
            : "fixed left-0 top-0 w-[60%] h-full border-r border-r-gray-900 bg-[#000328]/80 ease-in-out duration-500 cursor-pointer"
        }
      >
        <img
          src={"/images/top.png"}
          alt="Top"
          className="h-8 md:h-10 w-auto ml-4 mt-8 -mb-2"
          onClick={() => { navigate("/"); setNav(false); }}
        />
        <ul className="uppercase p-4">
          <li
            className={`p-4 border-b border-gray-600/50 hover:text-[#E0B0FF] transition duration-300 cursor-pointer ${current === "/" ? "text-[#E0B0FF]" : ""}`}
            onClick={() => { navigate("/"); handleNav(); }}
          >
            Home
          </li>
          <li
            className={`p-4 border-b border-gray-600/50 hover:text-[#E0B0FF] transition duration-300 cursor-pointer ${current === "/login" ? "text-[#E0B0FF]" : ""}`}
            onClick={() => { navigate("/login"); handleNav(); }}
          >
            Login
          </li>
          <li
            className={`p-4 border-b border-gray-600/50 hover:text-[#E0B0FF] transition duration-300 cursor-pointer ${current === "/products" ? "text-[#E0B0FF]" : ""}`}
            onClick={() => { navigate("/products"); handleNav(); }}
          >
            Products
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
