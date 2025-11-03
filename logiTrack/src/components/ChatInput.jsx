import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

import "./ChatInput.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const clip = <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: "1.5rem" }} />;
const send = <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "1.5rem" }} />;

export const ChatInput = ({ onSend, onAttach, sidebarWidth = 320 }) => {
  const [text, setText] = useState("");
  const liveRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      // annnounce empty submission
      if (liveRef.current) liveRef.current.textContent = "Escribe un mensaje antes de enviar";
      return;
    }
    if (onSend) onSend(trimmed);
    setText("");
    if (liveRef.current) liveRef.current.textContent = "Mensaje enviado";
    // clear live message after short time so it can be reused
    setTimeout(() => { if (liveRef.current) liveRef.current.textContent = ""; }, 800);
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
        placeholder="Escribe un mensaje"
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