import React, { useState, useMemo, useRef, useEffect } from "react";
import "./SidebarChat.css";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)
import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faGear,
  faPenToSquare,
  faTrashCan
} from "@fortawesome/free-solid-svg-icons";

const getBack = <FontAwesomeIcon icon={faArrowLeft} size="1pt" />;
const gear = <FontAwesomeIcon icon={faGear} style={{ fontSize: "1.5rem" }} />;
const newChat = <FontAwesomeIcon icon={faPenToSquare} size="1pt" />;
const trashcan = <FontAwesomeIcon icon={faTrashCan} size="1pt" />;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api`;
let idUsuario = null;
let nombreUsuario = '';
let usuarioEmail = '';

const usuarioGuardadoRaw = localStorage.getItem('usuario');
if (usuarioGuardadoRaw) {
  const usuarioGuardado = JSON.parse(usuarioGuardadoRaw);
  idUsuario = usuarioGuardado.idUsuario;
  nombreUsuario = `${usuarioGuardado.nombre} ${usuarioGuardado.apellido}`;
  usuarioEmail = usuarioGuardado.email;
}

// Enviar notificacion
export const enviarNotificacionChat = async (correo, idChat, descripcion) => {
  try {
    const response = await fetch(
      `${baseURL}/notificacion/notificaciones/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo,
          idChat,
          descripcion,
        }),
      }
    );

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

// Crear chat grupal
export async function crearChatGrupalRequest(correos, nombreGrupo) {
  try {
    const response = await fetch(`${baseURL}/chat/crearChatGrupal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correos, nombreGrupo })
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('✅ Respuesta del servidor:', data);

      const resultado = data?.data?.[0];

      if (!resultado || typeof resultado.resultcode !== 'number') {
        throw new Error('❌ Respuesta inválida del servidor: falta resultcode.');
      }

      switch (resultado.resultcode) {
        case 0:
          console.log('✅ Chat grupal creado exitosamente. ID:', resultado.idnuevochat);
          toast.success(`✅ Chat creado correctamente`);
          const notif = `${nombreUsuario} te ha agregado a ${nombreGrupo}.`;
          enviarNotificacionChat(usuarioEmail, resultado.idnuevochat, notif);
          return resultado;
        case 1:
          throw new Error('❌ Uno o más correos no existen en el sistema.');
          toast.error("❌ Uno o más correos no existen en el sistema.");
        case 3:
          throw new Error('❌ Error inesperado al crear el chat grupal.');
          toast.error("❌ Error inesperado al crear el chat grupal.");
        default:
          throw new Error(`❌ Código de resultado desconocido: ${resultado.resultcode}`);
      }
    } else {
      const text = await response.text();
      throw new Error(`Respuesta inesperada: ${text}`);
    }
  } catch (error) {
    console.error('❌ Error al crear el chat grupal:', error.message);
    throw error;
  }
}

export const SidebarChat = ({
  user = { name: "Usuario" },
  chats = initialChats,
  onSeleccionarChat,
  onAccion,
  onEliminarChat,
}) => {
  const [query, setQuery] = useState("");
  const [list, setList] = useState(chats);
  const [activeId, setActiveId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [emails, setEmails] = useState([usuarioEmail]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [email, setEmail] = useState("");
  const dropdownRef = useRef(null);
  const inputAddMemberEmail = useRef();

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/home", { state: { view: "Opciones" } });
  };

  // Para enviar senal de que se ha creado un chat
  const handleClickNewChat = () => {
    onAccion(prev => prev === "clickeado" ? "" : "clickeado");
  }

  const getIniciales = (texto) =>
    texto
      .trim()
      .split(/\s+/) // divide por espacios múltiples
      .slice(0, 2) // toma solo las dos primeras palabras
      .map((p) => p[0]?.toUpperCase() || "") // saca la inicial en mayúscula
      .join("");

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
      setShowGroupModal(true);
    }
  };

  const handleCreate = () => {
    console.log("Creando chat con:", email);
    if (email != usuarioEmail && email != "") {
      crearChatPrivado(usuarioEmail, email);
      setShowModal(false);
      setEmail("");
    } else {
      toast.error("❌ Ingrese un correo válido");
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEmail("");
  };

  const handleAddEmail = () => {
    const nuevoEmail = newMemberEmail.trim().toLowerCase();

    // Validar si el campo está vacío
    if (!nuevoEmail) {
      toast.error("Por favor, ingresa un correo electrónico.");
      return;
    }

    // Validar si el correo ya existe en la lista
    if (emails.includes(nuevoEmail)) {
      toast.error("Este correo ya está en la lista de integrantes.");
      inputAddMemberEmail.current.value = "";
      return;
    }

    // Agregar el nuevo correo
    setEmails(prev => [...prev, nuevoEmail]);
    setNewMemberEmail(""); // limpiar campo después de agregar
    inputAddMemberEmail.current.value = "";

    console.log("Integrantes actuales:", [...emails, nuevoEmail]);
  };

  const handleRemoveMember = (index) => {
  setEmails(emails.filter((_, i) => i !== index));
};

  const handleCreateGroup = () => {
    const nombreValido = groupName.trim();

    // Validar nombre del grupo
    if (!nombreValido) {
      toast.error("Por favor, ingresa un nombre para el grupo.");
      return;
    }

    // Validar cantidad mínima de integrantes
    if (emails.length < 2) {
      toast.error("El grupo debe tener al menos 2 integrantes (incluyéndote a ti).");
      return;
    }

    console.log("Nuevo grupo:", { nombreGrupo: nombreValido, integrantes: emails });

    // Llamar a la función de creación del grupo
    crearChatGrupalRequest(emails, nombreValido);

    setShowGroupModal(false);
  };


  const handleCancelGroup = () => {
    setShowGroupModal(false);
    setEmails([""]);
    setNewMemberEmail("");
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el click fue en el overlay (fuera del modal)
      if (event.target.classList.contains("modal-overlay")) {
        setShowGroupModal(false);
      }
    };

    if (showGroupModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Limpieza
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowGroupModal]);

  return (
    <aside
      className="app-sidebar"
      aria-label="Barra lateral de conversaciones"
      role="complementary"
    >
      <header className="sidebar-top" role="region" aria-label="Usuario">
        <div className="user-row">
          <div className="user-avatar" aria-hidden="true">
            {getIniciales(user.name)}
          </div>
          <div className="user-name" tabIndex="0">
            {user.name}
          </div>
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

      <nav
        className="sidebar-middle"
        role="navigation"
        aria-label="Acciones de chat"
      >
        <div className="actions">
          <button
            className="btn-back-arrow"
            onClick={() => {navigate("/home");
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
              <div className="dropdown-menu" ref={dropdownRef}>
                <button onClick={() => handleOptionClick("privado")}>
                  Chat privado
                </button>
                <button onClick={() => handleOptionClick("grupal")}>
                  Chat grupal
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
                  onChange={(e) => setEmail(e.target.value.toLocaleLowerCase())}
                />
                <div className="modal-buttons">
                  <button className="btn-create" onClick={() => {handleCreate(); 
                                                                handleClickNewChat();}}>
                    Crear
                  </button>
                  <button className="btn-cancel" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showGroupModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Nuevo chat grupal</h2>

                <label>Nombre del grupo</label>
                <input
                  type="text"
                  placeholder="Ej. Equipo de proyecto"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />

                <label>Integrantes</label>
                <table
                  className="members-table"
                  role="table"
                  aria-label="Miembros del nuevo chat grupal"
                >
                  <thead>
                    <tr role="row">
                      <th role="columnheader">Correo electrónico</th>
                      <th role="columnheader">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {emails?.map((member, index) => (
                      <tr key={index} role="row">
                        <td role="cell">{member}</td>
                        <td role="cell">
                          <button
                            className="small-danger"
                            onClick={() => handleRemoveMember(index)}
                            aria-label={`Eliminar miembro con correo ${member}`}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && handleRemoveMember(index)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}

                    <tr className="add-member-row">
                      <td colSpan="2">
                        <div className="add-member">
                          <label className="sr-only" htmlFor="new-member-email">
                            Correo del nuevo integrante
                          </label>

                          <input
                            id="new-member-email"
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            value={newMemberEmail}
                            ref={inputAddMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value.toLowerCase())}
                          />

                          <button
                            onClick={handleAddEmail}
                            aria-label="Agregar nuevo integrante"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>


                <div className="modal-buttons">
                  <button
                    className="btn-create"
                    onClick={() => {
                      handleCreateGroup();
                      handleClickNewChat();
                    }}
                  >
                    Crear
                  </button>

                  <button className="btn-cancel" onClick={handleCancelGroup}>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        
      </nav>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      />

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
            chats.map((chat) => (
              <div
                key={chat.id}
                role="listitem"
                tabIndex="0"
                className="chat-item"
                aria-label={`Chat con ${chat.name}. ${chat.snippet}`}
                tableIndex={0}
                onClick={() => {
                  setActiveId(chat.id);
                  onSeleccionarChat(chat);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveId(chat.id);
                    onSeleccionarChat(chat);
                  }
                }}
                //data-active={chat.id === activeId}
                style={{
                  position: "relative", // 🔹 necesario para posicionar el botón
                  padding: "0.8rem 1rem",
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
              >
                {/* 🔹 Contenido del chat */}
                <div className="chat-thumb" aria-hidden="true">
                  {getIniciales(chat.name)}
                </div>
                <div className="chat-meta" style={{ marginLeft: "0.8rem" }}>
                  <div className="chat-title" style={{ fontWeight: "bold" }}>
                    {chat.name}
                  </div>
                  <div className="chat-snippet" style={{ opacity: 0.8 }}>
                    {chat.snippet}
                  </div>
                </div>
                
                {/* 🔹 Botón eliminar en la esquina superior derecha */}
                <button
                  className="delete-chat-btn"
                  aria-label={`Eliminar chat con ${chat.name}`}
                  onClick={(e) => {
                    e.stopPropagation(); // evita seleccionar el chat al eliminar
                    onEliminarChat(chat.id); // ⚡ función que recibirás como prop
                  }}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#e74c3c",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                >
                  {trashcan}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

    </aside>
  );
};
