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
   
  const [chatSelected, setChatSelected] = useState("null");
  const [mensajes, setMensajes] = useState([]);
  
  const seleccionarChat = (chat) => {
    console.log("✅ Chat recibido del hijo:", chat);
    setChatSelected(chat);
  };

  console.log(`EHHH ${chatSelected.id}`);

  const fetchMensajes = async (idChat) => {
    if (!idChat) return;

    try {
      const response = await fetch(`http://localhost:3001/api/chat/msj/${idChat}`);
      if (!response.ok) throw new Error("Error al obtener mensajes");
        const data = await response.json();

        const mensajesTransformados = data.map(msg => ({
        ...msg,
        Usuario: {
          ...msg.Usuario,
          nombre: msg.Usuario?.nombre === usuarioGuardado.nombre ? "Yo" : msg.Usuario?.nombre || "Desconocido"
        }
      }));

      setMensajes(mensajesTransformados);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    }
  };

  useEffect(() => {
    fetchMensajes(chatSelected.id);
  }, [chatSelected.id]);

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

  const handleSend = async (mensaje) => {
    console.log("Mensaje recibido del hijo:", mensaje);

    // 1️⃣ Actualizar estado local de forma optimista
    setMensajes(prev => [
      ...prev,
      {
        id: prev.length + 1,   // id temporal
        Usuario: { nombre: "Yo" }, 
        contenido: mensaje,
        fechaHora: new Date().toISOString(),
      }
    ]);

    try {
      // 2️⃣ Enviar mensaje al backend
      await fetch("http://localhost:3001/api/chat/enviarMsj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idUsuario: idUsuario, // variable que debes tener en tu componente padre
          idChat: idChat,       // chat seleccionado
          contenido: mensaje
        })
      });

      // 3️⃣ Traer todos los mensajes actualizados del chat
      const response = await fetch(`http://localhost:3001/api/chat/msj/${idChat}`);
      if (!response.ok) throw new Error("Error al obtener mensajes");
      const data = await response.json();

      // 4️⃣ Actualizar el estado con los mensajes reales del backend
      setMensajes(data);

    } catch (error) {
      console.error("Error enviando o recargando mensajes:", error);
    }
  };

  const handleAttach = () => {
    console.log("Adjuntar archivo");
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
      <SidebarChat user={user} chats={chats} onSeleccionarChat={seleccionarChat} />
      <ChatHeader chatName={chatSelected.name} />
      <main className="main-content">
        <ChatMessages mensajes={mensajes} currentUser={usuarioGuardado}/>
      </main>
      <ChatInput idUsuario={idUsuario} idChat={chatSelected?.id} onEnviar={handleSend} />
    </div>
  );
};

