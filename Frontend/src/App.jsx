import { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import CreatePoolPage from "./pages/CreatePoolPage";
import { Routes, Route } from "react-router-dom";
import ExplorePoolsPage from "./pages/ExplorePoolsPage";
import SwapPage from "./pages/SwapPage";
import PoolPage from "./pages/PoolPage";
import LiquidityPage from "./pages/LiquidityPage";
import DashBoard from "./pages/Dashboard";

function App() {
  return (
    <div className="min">
      <Navbar />
      <main className="px-[8%]">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/CreatePool" element={<CreatePoolPage />} />
          <Route path="/ExplorePools" element={<ExplorePoolsPage />} />
          <Route path="/Swap/:address" element={<SwapPage />} />
          <Route path="/Pool/:address" element={<PoolPage />} />
          <Route path="/Liquidity/:address" element={<LiquidityPage />} />
          <Route path="/Dashboard" element={<DashBoard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
