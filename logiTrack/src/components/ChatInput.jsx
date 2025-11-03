import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

import "./ChatInput.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const clip = <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: "1.5rem" }} />;
const send = <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "1.5rem" }} />;

const baseURL = "http://localhost:3001/api/chat";

const enviarMensaje = async (idUsuario, idChat, contenido) => {
  try {
    const response = await fetch(`${baseURL}/enviarMsj`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario, idChat, contenido }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    throw error;
  }
};


export const ChatInput = ({ idUsuario, idChat, onEnviar, sidebarWidth = 320 }) => {
  const [text, setText] = useState("");
  const liveRef = useRef(null);

  const handleSubmit = async () => {
    const mensaje = text.trim();
    if (!mensaje) return;

    // Aquí podrías llamar al endpoint para enviar mensaje
    await enviarMensaje(idUsuario, idChat, mensaje);

    // Avisar al padre
    if (onEnviar) {
      onEnviar(mensaje);
    }

    setText(""); // Limpiar input
  };

  const handleAttach = (e) => {
    if (onAttach) onAtthandleAttachach(e);
    if (liveRef.current) liveRef.current.textContent = "Abrir diálogo de adjuntos";
    setTimeout(() => { if (liveRef.current) liveRef.current.textContent = ""; }, 800);
  };

  return (
    <div className="message-input-container">
      <button className="attach-button"
        aria-label="Botón adjuntar archivo"
        onClick={handleAttach}>
        {clip}
      </button>

      <input
        type="text"
        value={text}
        placeholder="Escribe un mensaje"
        onChange={(e) => setText(e.target.value)}
        className="message-input"
      />

      <button className="send-button"
        aria-label="Botón enviar mensaje"
        onClick={handleSubmit}>
        {send}
      </button>
    </div>
  );
};