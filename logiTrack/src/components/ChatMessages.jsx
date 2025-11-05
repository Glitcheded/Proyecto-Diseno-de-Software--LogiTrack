import React, { useState, useEffect, useRef } from "react";
import "./ChatMessages.css";

export const ChatMessages = ({ mensajes }) => {
  let usuarioGuardado = null;
  let idUsuario = null;
  let nombreUsuario = '';
  let usuarioEmail = '';

  const usuarioGuardadoRaw = localStorage.getItem('usuario');
  if (usuarioGuardadoRaw) {
    usuarioGuardado = JSON.parse(usuarioGuardadoRaw);
    idUsuario = usuarioGuardado.idUsuario;
    nombreUsuario = usuarioGuardado.nombre;
    usuarioEmail = usuarioGuardado.email;
  }

  const mensajesRef = useRef(null);

  console.log(usuarioGuardado);

  // Scrollea al final
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]); // se activa cada vez que cambian los mensajes

  return (
  <div className="chat-messages-container" role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false">
    <div className="chat-messages-content" ref={mensajesRef}>
      {mensajes.map((msg, index) => {
        const isCurrentUser = msg.Usuario?.nombre?.toLowerCase() === nombreUsuario?.toLowerCase();

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
