import React, { useState, useEffect } from "react";
import "./Chat.css";
import { SidebarChat } from './SidebarChat';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from "./ChatMessages";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

const baseURL = "http://localhost:3001/api";
const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
const idUsuario = usuarioGuardado.idUsuario;
const nombreUsuario = usuarioGuardado.nombre  + " " + usuarioGuardado.apellido;
const usuarioEmail = usuarioGuardado.email;
const chatSeleccionado = JSON.parse(localStorage.getItem("chatSeleccionado"));

export const Chat = ({}) => {
  console.log('ID:', idUsuario);
  console.log('Nombre:', nombreUsuario);
  console.log(Object.keys(usuarioGuardado));

  const user = { name: nombreUsuario};
  const [chats, setChats] = useState([]);
  const [chatSeleccionado, setChatSeleccionado] = useState(
    JSON.parse(localStorage.getItem("chatSeleccionado")) || null
  );

  console.log(`EHHH ${chatSeleccionado?.name}`);

  // Get chats
  const obtenerChatsPorCorreo = async (correo, setChats) => {
    try {
      const response = await fetch(`${baseURL}/chat/${correo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Chats obtenidos:", data);

      // Actualizar el estado
      setChats(data);
    } catch (error) {
      console.error("Error al obtener los chats:", error);
      // Si usas react-toastify, puedes avisar al usuario:
      // toast.error("❌ No se pudieron cargar los chats");
    }
  };

  const handleSend = (mensaje) => {
    console.log("Mensaje enviado:", mensaje);
    // lógica para enviar mensaje
  };

  const handleAttach = () => {
    console.log("Adjuntar archivo");
    // lógica para abrir diálogo de adjuntos
  };

  let chatName = chatSeleccionado?.name || "";

  useEffect(() => {
    // Intentar leer el usuario guardado del localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    const correo = usuarioGuardado?.email; // <- usa "email", no "correo"

    if (correo) {
      obtenerChatsPorCorreo(correo, setChats);
    }
  }, []); // se ejecuta solo una vez al montar el componente

  useEffect(() => {
    const handleStorageChange = () => {
      const nuevoChat = JSON.parse(localStorage.getItem("chatSeleccionado"));
      setChatSeleccionado(nuevoChat);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div>
      <SidebarChat user={user} chats={chats}  />
      <ChatHeader chatName={chatName} />
      <main className="main-content">
        <ChatMessages chatId={1} currentUser={user} />
      </main>
      <ChatInput onSend={handleSend} onAttach={handleAttach} />
    </div>
  );
};

