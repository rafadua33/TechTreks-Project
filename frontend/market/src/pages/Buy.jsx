import React from "react";
import { Link } from "react-router-dom";

const Buy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Here is where you buy things</h1>
      <Link to="/" className="text-[#E0B0FF] hover:underline">
        Back to Home
      </Link>
    </div>
  );
};

export default Buy;
