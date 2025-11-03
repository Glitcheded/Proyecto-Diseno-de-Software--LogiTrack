import React, { useState, useEffect } from "react";
import "./Chat.css";
import { SidebarChat } from './SidebarChat';
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

export const Chat = ({}) => {
  const user = { name: "Susana Pérez", role: "Admin" };
  const chats = [
    { id: 1, name: "Federico Granados", snippet: "¿Listo?", initials: "FG" },
    // ...
  ];

  return (
    <div className="home-container">
      <SidebarChat user={user} chats={chats} />
      <main className="main-content">
        {/* resto de la UI */}
      </main>

    </div>
  );
};

