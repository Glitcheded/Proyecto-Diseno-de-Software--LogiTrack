import React, { useState } from "react";
import { NavBar } from "./NavBar";
import "./Home.css";

export const Home = () => {
  const [selectedView, setSelectedView] = useState("Mis Tareas");

  return (
    <div className="home-container">
      <NavBar currentView={selectedView} changeView={setSelectedView} />
      <div className="menu-header">
        <h1>{selectedView}</h1>
      </div>
    </div>
  );
};
