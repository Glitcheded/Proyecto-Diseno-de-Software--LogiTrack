import React, { useState, useEffect } from "react";
import "./Chat.css";
import { SidebarChat } from './SidebarChat';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from "./ChatMessages";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

export const Chat = ({}) => {
  const user = { name: "Susana Pérez", role: "Admin" };
  const chats = [
    { id: 1, name: "Federico Granados", snippet: "¿Listo?", initials: "FG" },
    // ...
  ];

  const handleSend = (mensaje) => {
    console.log("Mensaje enviado:", mensaje);
    // lógica para enviar mensaje
  };

  const handleAttach = () => {
    console.log("Adjuntar archivo");
    // lógica para abrir diálogo de adjuntos
  };

  const chatName = "Nombre de chat";

  return (
    <div>
      <SidebarChat user={user} chats={chats} />
      <ChatHeader chatName={chatName} />
      <main className="main-content">
        <ChatMessages chatId={1} currentUser={user} />
      </main>
      <ChatInput onSend={handleSend} onAttach={handleAttach} />
    </div>
  );
};

