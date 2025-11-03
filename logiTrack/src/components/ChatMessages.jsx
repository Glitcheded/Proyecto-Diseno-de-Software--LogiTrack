import React, { useState, useEffect } from "react";
import "./ChatMessages.css";

export const ChatMessages = ({ chatId, currentUser }) => {
  const [messages, setMessages] = useState([]);

  // 🔹 Función simulada para obtener los mensajes de un chat
  const fetchMessages = async (chatId) => {
    // Aquí podrías hacer una llamada al backend, por ejemplo:
    // const response = await fetch(`/api/chats/${chatId}/messages`);
    // const data = await response.json();
    // setMessages(data);

    // Datos de ejemplo:
    const dummyData = [
      {
        id: 1,
        sender: "Usuario1",
        text: "Hola equipo, ¿ya revisaron los últimos cambios del proyecto?",
        time: "02/10/25 11:45",
      },
      {
        id: 2,
        sender: "Usuario1",
        text: "Sí, acabo de subir la actualización con los ajustes en la interfaz. Aquí dejo el archivo de prueba para que lo revisen.",
        time: "02/10/25 11:55",
      },
      {
        id: 3,
        sender: "Usuario1",
        text: "diseño_interfaz_v1.png",
        time: "02/10/25 12:00",
        file: true,
      },
      {
        id: 4,
        sender: currentUser.name,
        text: "Perfecto, lo reviso en la tarde y les comento.",
        time: "02/10/25 12:10",
      },
    ];

    setMessages(dummyData);
  };

  useEffect(() => {
    fetchMessages(chatId);
  }, [chatId]);

  return (
    <div className="chat-messages-container">
      <div className="chat-messages-content">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender === currentUser.name;
          return (
            <div
              key={msg.id}
              className={`message-bubble ${
                isCurrentUser ? "own-message" : "other-message"
              }`}
            >
              {!isCurrentUser && (
                <div className="sender-name">{msg.sender}</div>
              )}
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{msg.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
