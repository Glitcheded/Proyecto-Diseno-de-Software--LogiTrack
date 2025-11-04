import React, { useEffect, useState } from "react";
import "./ChatHeader.css";

const chatSeleccionado = JSON.parse(localStorage.getItem("chatSeleccionado"));

export const ChatHeader = ({ chatName }) => {
  const [chatSeleccionado, setChatSeleccionado] = useState(
    JSON.parse(localStorage.getItem("chatSeleccionado")) || null
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const nuevoChat = JSON.parse(localStorage.getItem("chatSeleccionado"));
      setChatSeleccionado(nuevoChat);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="chat-header" role="banner" aria-label="Encabezado del chat">
      <h2 className="chat-title" aria-live="polite">
        {chatName}
      </h2>
    </div>
  );
};

