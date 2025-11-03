import React, { useState, useEffect } from "react";
import "./ChatMessages.css";

export const ChatMessages = ({ mensajes, currentUser }) => {
  const [messages, setMessages] = useState([]);

  return (
    <div className="chat-messages-container">
    <div className="chat-messages-content">
      {mensajes.map((msg, index) => {
        const isCurrentUser = msg.Usuario?.nombre === currentUser.name;

        return (
          <div
            key={index}
            className={`message-bubble ${isCurrentUser ? "own-message" : "other-message"}`}
          >
            {!isCurrentUser && (
              <div className="sender-name">{msg.Usuario?.nombre || "Desconocido"}</div>
            )}
            <div className="message-text">{msg.contenido}</div>
            <div className="message-time">
              {msg.fechaHora ? new Date(msg.fechaHora).toLocaleTimeString() : ""}
            </div>
          </div>
        );
      })}
    </div>
  </div>
  );
};
