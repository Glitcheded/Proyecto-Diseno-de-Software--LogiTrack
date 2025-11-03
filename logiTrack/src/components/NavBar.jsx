import React, { useState, useEffect } from "react";
import "./NavBar.css";
import { useNavigate } from "react-router-dom";

const baseURL = "http://localhost:3001/api";

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

const userIco = <FontAwesomeIcon icon={faUser} size="2x" />;
const optionsIco = <FontAwesomeIcon icon={faGear} size="2x" />;
const clipboardIco = (
  <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: "1.6rem" }} />
);
const calendarIco = (
  <FontAwesomeIcon icon={faCalendar} style={{ fontSize: "1.6rem" }} />
);
const messageIco = (
  <FontAwesomeIcon icon={faMessage} style={{ fontSize: "1.6rem" }} />
);
const envelopeIco = (
  <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: "1.6rem" }} />
);
const fileIco = (
  <FontAwesomeIcon icon={faFile} style={{ fontSize: "1.6rem" }} />
);
const previousIco = (
  <FontAwesomeIcon icon={faClockRotateLeft} style={{ fontSize: "1.6rem" }} />
);
const arrowIco = <FontAwesomeIcon icon={faChevronUp} size="sm" />;

export const NavBar = ({
  currentView,
  changeView,
  projectList,
  selectedProject,
  setSelectedProject,
}) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userName, setUserName] = useState("Usuario");

  const [showActiveProjects, setShowActiveProjects] = useState(false);
  const [showFinishedProjects, setShowFinishedProjects] = useState(false);

  const activeProjects = projectList.filter((p) => p.state === "En proceso");
  const finishedProjects = projectList.filter(
    (p) => p.state === "Finalizado" || p.state === "Cancelado"
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("supabaseToken");

        if (!token) {
          console.warn("No token found in localStorage");
          return;
        }

        const res = await fetch(`${baseURL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Error fetching user:", res.statusText);
          return;
        }

        if (res.status === 401) {
          console.warn("Token expired, refreshing...");
          const { data, error } = await supabase.auth.refreshSession();

          if (!error && data?.session?.access_token) {
            localStorage.setItem("supabaseToken", data.session.access_token);
            // Retry the request
            return fetchUser();
          } else {
            console.error("Session refresh failed, logging out...");
            await supabase.auth.signOut();
            return;
          }
        }

        const data = await res.json();
        console.log("User data:", data);

        if (data?.nombre) {
          setUserName(data.nombre);
        }
      } catch (error) {
        console.error("Fetch user failed:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async (navigate, setShowUserDropdown) => {
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

      if (!res.ok) {
        console.error("Logout error:", data.error);
        alert("Error al cerrar sesión");
        return;
      }

      console.log("Logout successful:", data.message);

      // Clear token and UI state
      localStorage.removeItem("supabaseToken");
      localStorage.removeItem("usuario");
      setShowUserDropdown(false);
      navigate("/");
    } catch (error) {
      console.error("Error en logout:", error);
      alert("Error al cerrar sesión");
    }
  };

  return (
    <div className="NV-container">
      <div className="options-container">
        <div className="user-icon-wrapper">
          <div
            className="user-icon"
            onClick={() => setShowUserDropdown((prev) => !prev)}
          >
            <div className="icons">{userIco}</div>
            {userName}
          </div>

          {showUserDropdown && (
            <div className="user-dropdown">
              <div
                className="dropdown-item"
                onClick={() => handleLogout(navigate, setShowUserDropdown)}
              >
                Configuración
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  localStorage.removeItem("supabaseToken");
                  navigate("/");
                  setShowUserDropdown(false);
                }}
              >
                Cerrar Sesión
              </div>
            </div>
          )}
        </div>

        <div className="options-others">
          <div className="icons" onClick={() => changeView("Opciones")}>
            {optionsIco}
          </div>
        </div>
      </div>

      <div className="navbar-container">
        <div
          className={
            currentView === "Mis Tareas"
              ? "navbar-element navbar-selected"
              : "navbar-element"
          }
          onClick={() => changeView("Mis Tareas")}
        >
          <div className="icons">{clipboardIco}</div>
          Mis Tareas
        </div>

        <div
          className={
            currentView === "Google Calendario"
              ? "navbar-element navbar-selected"
              : "navbar-element"
          }
          onClick={() => changeView("Google Calendario")}
        >
          <div className="icons">{calendarIco}</div>
          Google Calendario
        </div>

        <div
          className={
            currentView === "Chat"
              ? "navbar-element navbar-selected"
              : "navbar-element"
          }
          onClick={() => navigate("/chat")}
        >
          <div className="icons">{messageIco}</div>
          Chat
        </div>

        <div
          className={
            currentView === "Notificaciones"
              ? "navbar-element navbar-selected"
              : "navbar-element"
          }
          onClick={() => changeView("Notificaciones")}
        >
          <div className="icons">{envelopeIco}</div>
          Notificaciones
        </div>

        <div
          className={
            currentView === "Mis Proyectos"
              ? "navbar-element navbar-selected"
              : "navbar-element"
          }
          onClick={() => changeView("Mis Proyectos")}
        >
          <div className="icons">{fileIco}</div>
          <span>Mis Proyectos</span>
          <div
            className={`arrow-icon ${showActiveProjects ? "open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowActiveProjects(!showActiveProjects);
              setShowFinishedProjects(false);
            }}
          >
            {arrowIco}
          </div>
        </div>

        {showActiveProjects && (
          <div className="dropdown">
            {activeProjects.length > 0 ? (
              activeProjects.map((proj) => (
                <div
                  key={proj.id}
                  className={`dropdown-item ${
                    currentView === "Mis Proyectos / Proyecto" &&
                    selectedProject === proj.name
                      ? "selected-project"
                      : ""
                  }`}
                  onClick={() => {
                    changeView("Mis Proyectos / Proyecto");
                    setSelectedProject(proj.name);
                  }}
                >
                  {proj.name}
                </div>
              ))
            ) : (
              <div className="dropdown-item empty">
                No hay proyectos activos
              </div>
            )}
          </div>
        )}

        <div
          className={
            currentView === "Proyectos Anteriores"
              ? "navbar-element navbar-selected"
              : "navbar-element"
          }
          onClick={() => changeView("Proyectos Anteriores")}
        >
          <div className="icons">{previousIco}</div>
          <span>Proyectos Anteriores</span>
          <div
            className={`arrow-icon ${showFinishedProjects ? "open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowFinishedProjects(!showFinishedProjects);
              setShowActiveProjects(false);
            }}
          >
            {arrowIco}
          </div>
        </div>

        {showFinishedProjects && (
          <div className="dropdown">
            {finishedProjects.length > 0 ? (
              finishedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className={`dropdown-item ${
                    currentView === "Proyectos Anteriores / Proyecto" &&
                    selectedProject === proj.name
                      ? "selected-project"
                      : ""
                  }`}
                  onClick={() => {
                    changeView("Proyectos Anteriores / Proyecto");
                    setSelectedProject(proj.name);
                  }}
                >
                  {proj.name}
                </div>
              ))
            ) : (
              <div className="dropdown-item empty">
                No hay proyectos anteriores
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
