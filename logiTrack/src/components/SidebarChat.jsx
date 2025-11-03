import React, { useState, useMemo, useRef, useEffect } from "react";
import "./SidebarChat.css";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faGear, faPenToSquare, faMagnifyingGlass, faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const getBack = <FontAwesomeIcon icon={faArrowLeft} size="1pt" />;
const gear = <FontAwesomeIcon icon={faGear} style={{ fontSize: "1.5rem" }} />;
const newChat = <FontAwesomeIcon icon={faPenToSquare} size="1pt" />;
const search = <FontAwesomeIcon icon={faMagnifyingGlass} size="1pt" />;

const baseURL = "http://localhost:3001/api";
const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
const idUsuario = usuarioGuardado.idUsuario;
const nombreUsuario = usuarioGuardado.nombre  + " " + usuarioGuardado.apellido;
const usuarioEmail = usuarioGuardado.email;
const chatSeleccionado = JSON.parse(localStorage.getItem("chatSeleccionado"));

export const SidebarChat = ({
  user = { name: "Usuario" },
  chats = initialChats
}) => {
  const [query, setQuery] = useState("");
  const [list, setList] = useState(chats);
  const [activeId, setActiveId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const dropdownRef = useRef(null);
  const [chatSeleccionado, setChatSeleccionado] = useState(
  JSON.parse(localStorage.getItem("chatSeleccionado"))
);

  console.log(`AHHH ${chatSeleccionado?.name}`);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/home", { state: { view: "Opciones" } });
  };

  const getIniciales = (texto) =>
  texto
    .trim()
    .split(/\s+/)           // divide por espacios múltiples
    .slice(0, 2)            // toma solo las dos primeras palabras
    .map(p => p[0]?.toUpperCase() || "") // saca la inicial en mayúscula
    .join("");

  const handleChatSelect = (chat) => {
    localStorage.setItem("chatSeleccionado", JSON.stringify(chat));
    setChatSeleccionado(chat); // <-- esto forza el re-render inmediato
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      c => c.name.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q)
    );
  }, [query, list]);

  // Enviar notificacion
  const enviarNotificacionChat = async (correo, idChat, descripcion) => {
    try {
      const response = await fetch(`${baseURL}/notificacion/notificaciones/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo,
          idChat,
          descripcion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Notificación enviada:", data);

      // Opcional: mostrar un toast si usas react-toastify
      // import { toast } from "react-toastify";
      // toast.success("✅ Notificación enviada correctamente");

      return data;
    } catch (error) {
      console.error("Error al enviar notificación:", error);
      // toast.error("❌ Error al enviar notificación");
    }
  };

  // Crear chat privado
  const crearChatPrivado = async (correoUsuario1, correoUsuario2) => {
    try {
      const response = await fetch(`${baseURL}/chat/crearChatPrivado`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correoUsuario1, correoUsuario2 }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (Array.isArray(data) && data.length > 0) {
        const { resultcode, idnuevochat } = data[0];

        switch (resultcode) {
          case 0:
            toast.success(`✅ Chat creado correctamente`);
            const notif = `Tienes un nuevo chat con ${nombreUsuario}.`;
            enviarNotificacionChat(correoUsuario1, idnuevochat, notif);
            break;
          case 1:
            toast.error("❌ El usuario no existe.");
            break;
          case 2:
            toast.warning("⚠️ Ya existe un chat con este usuario.");
            break;
          case 3:
            toast.error("❌ No se pudo generar el chat.");
            break;
          default:
            toast.info("ℹ️ Respuesta desconocida del servidor.");
            break;
        }
      } else {
        toast.error("❌ Respuesta inesperada del servidor.");
      }

      return data;
    } catch (error) {
      console.error("Error al crear chat privado:", error);
      toast.error("⚠️ Error al conectar con el servidor.");
    }
  };

  const handleNewChat = () => {
    setShowDropdown((prev) => !prev); // 👈 alterna mostrar/ocultar menú
  };

  const handleOptionClick = (option) => {
    setShowDropdown(false);
    if (option === "privado") {
      console.log("Seleccionaste: Chat privado");
        setShowModal(true);
    } else {
      console.log("Seleccionaste: Chat grupal");
    }
  };

  const handleCreate = () => {
    console.log("Creando chat con:", email);
    if (email != usuarioEmail && email != "") {
      crearChatPrivado(usuarioEmail, email);
      setShowModal(false);
      setEmail("");
    }
    else {
      toast.error("❌ Ingrese un correo válido");
    }
    
  };

  const handleCancel = () => {
    setShowModal(false);
    setEmail("");
  };

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el click fue en el overlay (fuera del modal)
      if (event.target.classList.contains("modal-overlay")) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Limpieza
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <aside className="app-sidebar" aria-label="Barra lateral de conversaciones" role="complementary">
      <header className="sidebar-top" role="region" aria-label="Usuario">
        <div className="user-row">
          <div className="user-avatar" aria-hidden="true">
            {getIniciales(user.name)}
          </div>
          <div className="user-name" tabIndex="0">{user.name}</div>
          <button
            className="btn-icon"
            aria-label="Abrir configuracion de usuario"
            title="Configuración"
            onClick={handleClick}
          >
            {gear}
          </button>
        </div>
      </header>

      <nav className="sidebar-middle" role="navigation" aria-label="Acciones de chat">
        <div className="actions">
          <button
            className="btn-back-arrow"
            onClick={() => {navigate("/home");
              localStorage.removeItem("chatSeleccionado");
            }}
            aria-label="Regresar a la página principal"
          >
            {getBack}
          </button>

          <div className="actions" style={{ position: "relative" }}>
            <button
              className="btn-primary"
              onClick={handleNewChat}
              aria-label="Crear nuevo chat"
            >
              {newChat}
            </button>

            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => handleOptionClick("privado")}>
                  💬 Chat privado
                </button>
                <button onClick={() => handleOptionClick("grupal")}>
                  👥 Chat grupal
                </button>
              </div>
            )}
          </div>

          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Nuevo chat</h2>
                <label>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="modal-buttons">
                  <button className="btn-create" onClick={handleCreate}>
                    Crear
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        <form
          className="search-form"
          role="search"
          aria-label="Buscar chats"
          onSubmit={e => e.preventDefault()}
        >
          <label htmlFor="chat-search" className="sr-only">{search}</label>
          <input
            id="chat-search"
            className="search-input"
            type="search"
            placeholder="Buscar chat"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Campo de búsqueda de chat"
            aria-describedby="search-help"
          />
        </form>
        <div id="search-help" style={{ display: "none" }}>
          Escribe el nombre o el mensaje para filtrar
        </div>
      </nav>

      <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)" }} />

      <section
        className="sidebar-bottom"
        role="region"
        aria-label="Lista de chats"
      >
        <div
          role="list"
          className="chats-list"
          aria-live="polite"
          aria-relevant="additions removals"
        >
          {chats.length === 0 ? (
            <div role="status" aria-live="polite" style={{ opacity: 0.9 }}>
              No hay conversaciones que coincidan
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                role="listitem"
                tabIndex="0"
                className="chat-item"
                aria-label={`Chat con ${chat.name}. ${chat.snippet}`}
                onClick={() => {setActiveId(chat.id);
                  handleChatSelect(chat);}
                }
                onKeyDown={(e) => { if (e.key === "Enter") setActiveId(chat.id); }}
                data-active={chat.id === activeId}
              >
                <div className="chat-thumb" aria-hidden="true">{getIniciales(chat.name)}</div>
                <div className="chat-meta">
                  <div className="chat-title">{chat.name}</div>
                  <div className="chat-snippet">{chat.snippet}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </aside>
    
  );
};
