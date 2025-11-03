import React, { useState, useEffect } from "react";
import "./ChatMessages.css";

export const ChatMessages = ({ mensajes, currentUser }) => {
  const [messages, setMessages] = useState([]);

  return (
  <div className="chat-messages-container" role="log" aria-live="polite">
    <div className="chat-messages-content">
      {mensajes.map((msg, index) => {
        const isCurrentUser = msg.Usuario?.nombre === currentUser.nombre;

        return (
          <div
            key={index}
            className={`message-bubble ${isCurrentUser ? "own-message" : "other-message"}`}
            role="article"
            tabIndex={0} // permite enfocar la burbuja con TAB
            aria-label={`${isCurrentUser ? "Tu" : msg.Usuario?.nombre || "Desconocido"} dijo: ${msg.contenido}`}
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
