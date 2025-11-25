import React from "react";
import { Link } from "react-router-dom";

const Sell = () => {
  return (
    <div className="min-h-screen bg-[#000328] text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Here is where you sell things</h1>
      <Link to="/" className="text-[#E0B0FF] hover:underline">
        Back to Home
      </Link>
    </div>
  );
};

export default Sell;
