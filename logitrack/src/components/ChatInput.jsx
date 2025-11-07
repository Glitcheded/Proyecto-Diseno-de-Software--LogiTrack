import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)
import { enviarNotificacionChat } from './SidebarChat';

import "./ChatInput.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const send = <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "1.5rem" }} />;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api`;

export const enviarMensaje = async (idUsuario, idChat, contenido) => {
  try {
    // 🔹 Validaciones antes de enviar
    if (!idChat) {
      toast.error("Debes seleccionar un chat");
    }

    if (!contenido || contenido.trim() === "") {
      toast.error("El mensaje no puede estar vacío.");
    }

    const response = await fetch(`${baseURL}/chat/enviarMsj`, {
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
    throw error; // Re-lanzamos el error para que el caller lo maneje
  }
};


export const ChatInput = ({ currentChat, onEnviar, sidebarWidth = 320 }) => {
  let usuarioGuardado = null;
  let idUsuario = null;
  let nombreUsuario = '';
  let usuarioEmail = '';

  const usuarioGuardadoRaw = localStorage.getItem('usuario');
  if (usuarioGuardadoRaw) {
    usuarioGuardado = JSON.parse(usuarioGuardadoRaw);
    idUsuario = usuarioGuardado.idUsuario;
    nombreUsuario = `${usuarioGuardado.nombre} ${usuarioGuardado.apellido}`;
    usuarioEmail = usuarioGuardado.email;
  }

  const [text, setText] = useState("");
  const liveRef = useRef(null);
  const inputMsj = useRef();
  const buttonSend = useRef();

  const handleSubmit = async () => {
    const mensaje = text.trim();
    inputMsj.current.value = "";
    if (!mensaje) return;
    console.log(mensaje);
    // Aquí podrías llamar al endpoint para enviar mensaje
    await enviarMensaje(idUsuario, currentChat.id, mensaje);

    const notif = `${nombreUsuario}: ${mensaje}`;
    await enviarNotificacionChat(usuarioEmail, currentChat.id, notif);

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

      <input
        type="text"
        value={text}
        placeholder="Escribe un mensaje"
        ref={inputMsj}
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