import React, { useState } from "react";
import "./NavBar.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faGear,
  faClipboardList,
  faCalendar,
  faMessage,
  faEnvelope,
  faFile,
  faClockRotateLeft,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const iconStyles = { fontSize: "1.6rem" };

export const NavBar = ({
  currentView,
  changeView,
  misProyectos,
  proyectosAnteriores,
  selectedProject,
  setSelectedProject,
  userName,
}) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showActiveProjects, setShowActiveProjects] = useState(false);
  const [showFinishedProjects, setShowFinishedProjects] = useState(false);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("supabaseToken");
      const res = await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cerrar sesión");

      localStorage.removeItem("supabaseToken");
      localStorage.removeItem("usuario");
      setShowUserDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error al cerrar sesión");
    }
  };

  return (
    <nav className="NV-container" aria-label="Barra de navegación principal">
      {/* USER & OPTIONS HEADER */}
      <div className="options-container">
        <div className="user-icon-wrapper">
          <button
            className="user-icon"
            onClick={() => setShowUserDropdown((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={showUserDropdown}
            aria-label={`Menú de usuario para ${userName}`}
          >
            <FontAwesomeIcon icon={faUser} size="2x" aria-hidden="true" />
            <span>{userName}</span>
          </button>

          {showUserDropdown && (
            <div
              className="user-dropdown"
              role="menu"
              aria-label="Opciones de usuario"
            >
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={() => {
                  setShowUserDropdown(false);
                  changeView("Configuración");
                }}
              >
                Configuración
              </button>
              <button
                className="dropdown-item"
                role="menuitem"
                onClick={handleLogout}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        <div className="options-others">
          <button
            className="icons"
            onClick={() => changeView("Opciones")}
            aria-label="Abrir opciones"
          >
            <FontAwesomeIcon icon={faGear} size="2x" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* NAVIGATION MENU */}
      <ul className="navbar-container" role="menubar">
        <li>
          <button
            className={`navbar-element ${
              currentView === "Mis Tareas" ? "navbar-selected" : ""
            }`}
            onClick={() => changeView("Mis Tareas")}
            role="menuitem"
            aria-current={currentView === "Mis Tareas" ? "page" : undefined}
          >
            <FontAwesomeIcon
              icon={faClipboardList}
              style={iconStyles}
              aria-hidden="true"
            />
            <span>Mis Tareas</span>
          </button>
        </li>

        <li>
          <button
            className={`navbar-element ${
              currentView === "Chat" ? "navbar-selected" : ""
            }`}
            onClick={() => navigate("/chat")}
            role="menuitem"
            aria-current={currentView === "Chat" ? "page" : undefined}
          >
            <FontAwesomeIcon
              icon={faMessage}
              style={iconStyles}
              aria-hidden="true"
            />
            <span>Chat</span>
          </button>
        </li>

        <li>
          <button
            className={`navbar-element ${
              currentView === "Notificaciones" ? "navbar-selected" : ""
            }`}
            onClick={() => changeView("Notificaciones")}
            role="menuitem"
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              style={iconStyles}
              aria-hidden="true"
            />
            <span>Notificaciones</span>
          </button>
        </li>

        {/* --- ACTIVE PROJECTS --- */}
        <li>
          <button
            className={`navbar-element ${
              currentView === "Mis Proyectos" ? "navbar-selected" : ""
            }`}
            onClick={() => changeView("Mis Proyectos")}
            aria-haspopup="true"
            aria-expanded={showActiveProjects}
            role="menuitem"
          >
            <FontAwesomeIcon
              icon={faFile}
              style={iconStyles}
              aria-hidden="true"
            />
            <span>Mis Proyectos</span>
            <FontAwesomeIcon
              icon={faChevronUp}
              className={`arrow-icon ${showActiveProjects ? "open" : ""}`}
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation();
                setShowActiveProjects(!showActiveProjects);
                setShowFinishedProjects(false);
              }}
            />
          </button>

          {showActiveProjects && (
            <ul className="dropdown" role="menu">
              {misProyectos.length > 0 ? (
                misProyectos.map((proj) => (
                  <li key={proj.idProyecto}>
                    <button
                      className={`dropdown-item ${
                        currentView === "Mis Proyectos / Proyecto" &&
                        selectedProject === proj.idProyecto
                          ? "selected-project"
                          : ""
                      }`}
                      onClick={() => {
                        changeView("Mis Proyectos / Proyecto");
                        setSelectedProject(proj.idProyecto);
                      }}
                      role="menuitem"
                    >
                      {proj.nombre}
                    </button>
                  </li>
                ))
              ) : (
                <li className="dropdown-item empty">
                  No hay proyectos activos
                </li>
              )}
            </ul>
          )}
        </li>

        {/* --- FINISHED PROJECTS --- */}
        <li>
          <button
            className={`navbar-element ${
              currentView === "Proyectos Anteriores" ? "navbar-selected" : ""
            }`}
            onClick={() => changeView("Proyectos Anteriores")}
            aria-haspopup="true"
            aria-expanded={showFinishedProjects}
            role="menuitem"
          >
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              style={iconStyles}
              aria-hidden="true"
            />
            <span>Proyectos Anteriores</span>
            <FontAwesomeIcon
              icon={faChevronUp}
              className={`arrow-icon ${showFinishedProjects ? "open" : ""}`}
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation();
                setShowFinishedProjects(!showFinishedProjects);
                setShowActiveProjects(false);
              }}
            />
          </button>

          {showFinishedProjects && (
            <ul className="dropdown" role="menu">
              {proyectosAnteriores.length > 0 ? (
                proyectosAnteriores.map((proj) => (
                  <li key={proj.idProyecto}>
                    <button
                      className={`dropdown-item ${
                        currentView === "Proyectos Anteriores / Proyecto" &&
                        selectedProject === proj.idProyecto
                          ? "selected-project"
                          : ""
                      }`}
                      onClick={() => {
                        changeView("Proyectos Anteriores / Proyecto");
                        setSelectedProject(proj.idProyecto);
                      }}
                      role="menuitem"
                    >
                      {proj.nombre}
                    </button>
                  </li>
                ))
              ) : (
                <li className="dropdown-item empty">
                  No hay proyectos anteriores
                </li>
              )}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};
