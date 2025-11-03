import React, { useState, useMemo } from "react";
import "./SidebarChat.css";
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faGear, faPenToSquare, faMagnifyingGlass, faPaperclip, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const getBack = <FontAwesomeIcon icon={faArrowLeft} size="1pt" />;
const gear = <FontAwesomeIcon icon={faGear} style={{ fontSize: "1.5rem" }} />;
const newChat = <FontAwesomeIcon icon={faPenToSquare} size="1pt" />;
const search = <FontAwesomeIcon icon={faMagnifyingGlass} size="1pt" />;

export const SidebarChat = ({
  user = { name: "Usuario" },
  chats = initialChats
}) => {
  const [query, setQuery] = useState("");
  const [list, setList] = useState(chats);
  const [activeId, setActiveId] = useState(null);

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/home", { state: { view: "Opciones" } });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      c => c.name.toLowerCase().includes(q) || c.snippet.toLowerCase().includes(q)
    );
  }, [query, list]);

  function handleNewChat() {
    const next = {
      id: Date.now(),
      name: `Nuevo contacto ${list.length + 1}`,
      snippet: "Mensaje inicial",
      initials: "NC",
    };
    setList(prev => [next, ...prev]);
    setActiveId(next.id);
  }

  return (
    <aside className="app-sidebar" aria-label="Barra lateral de conversaciones" role="complementary">
      <header className="sidebar-top" role="region" aria-label="Usuario">
        <div className="user-row">
          <div className="user-avatar" aria-hidden="true">
            {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
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
            onClick={() => navigate("/home")}
            aria-label="Regresar a la página principal"
          >
            {getBack}
          </button>

          <button
            className="btn-primary"
            onClick={handleNewChat}
            aria-label="Crear nuevo chat"
          >
            {newChat}
          </button>
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
          {filtered.length === 0 ? (
            <div role="status" aria-live="polite" style={{ opacity: 0.9 }}>
              No hay conversaciones que coincidan
            </div>
          ) : (
            filtered.map(chat => (
              <div
                key={chat.id}
                role="listitem"
                tabIndex="0"
                className="chat-item"
                aria-label={`Chat con ${chat.name}. ${chat.snippet}`}
                onClick={() => setActiveId(chat.id)}
                onKeyDown={(e) => { if (e.key === "Enter") setActiveId(chat.id); }}
                data-active={chat.id === activeId}
              >
                <div className="chat-thumb" aria-hidden="true">{chat.initials}</div>
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
