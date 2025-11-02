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

  const [showActiveProjects, setShowActiveProjects] = useState(false);
  const [showFinishedProjects, setShowFinishedProjects] = useState(false);

  const activeProjects = projectList.filter((p) => p.state === "En proceso");
  const finishedProjects = projectList.filter(
    (p) => p.state === "Finalizado" || p.state === "Cancelado"
  );

  return (
    <div className="NV-container">
      <div className="options-container">
        <div className="user-icon-wrapper">
          <div
            className="user-icon"
            onClick={() => setShowUserDropdown((prev) => !prev)}
          >
            <div className="icons">{userIco}</div>
            Usuario
          </div>

          {showUserDropdown && (
            <div className="user-dropdown">
              <div
                className="dropdown-item"
                onClick={() => {
                  changeView("Opciones");
                  setShowUserDropdown(false);
                }}
              >
                Configuración
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
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
          onClick={() => changeView("Chat")}
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
