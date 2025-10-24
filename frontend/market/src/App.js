import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Analytics from "./components/Analytics";
import LoginPage from "./pages/LoginPage";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";

function App() {
  return (
    <div className="bg-gray-900 min-h-screen">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Analytics />
            </>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="buy" element={<Buy />} />
        <Route path="sell" element={<Sell />} />

      </Routes>
    </div>
  );
}

export default App;
