import React, { useState, useEffect } from "react";
import "./Chat.css";
import { SidebarChat, enviarNotificacionChat } from "./SidebarChat";
import { ChatInput, enviarMensaje } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api`;

export const Chat = ({}) => {
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

  const user = { name: nombreUsuario};
  const [chats, setChats] = useState([]); 
  const [chatSelected, setChatSelected] = useState("null");
  const [mensajes, setMensajes] = useState([]);
  const [accionSidebarChat, setAccionSidebarChat] = useState("");

  // Para obtener el chat que ha sido seleccionado del sidebar
  const seleccionarChat = (chat) => {
    console.log("✅ Chat recibido del sidebar:", chat);
    setChatSelected(chat);
  };

  // Get mensajes
  const fetchMensajes = async (idChat) => {
    if (!idChat) return;

    try {
      const response = await fetch(
        `${baseURL}/chat/msj/${idChat}`
      );
      if (!response.ok) throw new Error("Error al obtener mensajes");
      const data = await response.json();

      setMensajes(data);
    } catch (error) {
      console.error("Error cargando mensajes:", error);
    }
  };

  // Vuelve a llamar la funcion cuando se selecciona otro chat
  useEffect(() => {
    fetchMensajes(chatSelected.id);
  }, [chatSelected.id]);

  console.log(mensajes);

  // Get chats
  const obtenerChatsPorCorreo = async (correo, setChats) => {
    try {
      const response = await fetch(`${baseURL}/chat/${correo}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
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

    // Para renderizar de nuevo cuando se cree nuevo chat
    useEffect(() => {
      if (accionSidebarChat === "clickeado") {
        console.log("En el sidebarchat se ha creado un nuevo chat");
        obtenerChatsPorCorreo(usuarioEmail, setChats);
      }
    }, [accionSidebarChat]);

  // Para enviar mensajes
  const handleSend = async (mensaje) => {
    console.log("Mensaje recibido del hijo:", mensaje);

    // 1️⃣ Actualizar estado local de forma optimista
    setMensajes((prev) => [
      ...prev,
      {
        id: prev.length + 1, // id temporal
        Usuario: { nombre: "Yo" },
        contenido: mensaje,
        fechaHora: new Date().toISOString(),
      },
    ]);

    try {
      // Traer todos los mensajes actualizados del chat
      const response = await fetch(
        `${baseURL}/chat/msj/${chatSelected.id}`
      );
      if (!response.ok) throw new Error("Error al obtener mensajes");
      const data = await response.json();

      // 4️⃣ Actualizar el estado con los mensajes reales del backend
      setMensajes(data);
    } catch (error) {
      console.error("Error enviando o recargando mensajes:", error);
    }
  };

  //Para eliminar chats
  const eliminarChatRequest = async (idChat) => {
    try {
      const response = await fetch(`${baseURL}/chat/eliminarChat/${idChat}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al eliminar chat:", error);
      throw error;
    }
  };

  const onEliminarChat = async (idChat) => {
    const confirmar = window.confirm("¿Seguro que quieres eliminar este chat?");
    if (!confirmar) return;

    try {
      await eliminarChatRequest(idChat); // tu función backend o supabase
      setChats((prev) => prev.filter((c) => c.id !== idChat));
    } catch (error) {
      console.error("Error al eliminar chat:", error);
    }
  };


  useEffect(() => {
    // Intentar leer el usuario guardado del localStorage
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    const correo = usuarioGuardado?.email; // <- usa "email", no "correo"

    if (correo) {
      obtenerChatsPorCorreo(correo, setChats);
    }
  }, []); // se ejecuta solo una vez al montar el componente

  return (
    <div>
      <SidebarChat
        user={user}
        chats={chats}
        onSeleccionarChat={seleccionarChat}
        onAccion={setAccionSidebarChat}
        onEliminarChat={onEliminarChat}
      />
      <ChatHeader chatName={chatSelected.name} />
      <main className="main-content">
        <ChatMessages mensajes={mensajes} />
      </main>
      <ChatInput
        currentChat={chatSelected}
        onEnviar={handleSend}
      />
    </div>
  );
};
