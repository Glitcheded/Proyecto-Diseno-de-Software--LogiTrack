import React, { useState } from "react";
import { NavBar } from "./NavBar";
import "./Home.css";

import { MisTareas } from "./vistas/MisTareas";
import { GoogleCalendario } from "./vistas/GoogleCalendario";
import { Chat } from "./vistas/Chat";
import { Notificaciones } from "./vistas/Notificaciones";
import { MisProyectos } from "./vistas/MisProyectos";
import { ProyectosAnteriores } from "./vistas/ProyectosAnteriores";
import { Opciones } from "./vistas/Opciones";

export const Home = () => {
  const [selectedView, setSelectedView] = useState("Mis Tareas");

  const renderView = () => {
    switch (selectedView) {
      case "Mis Tareas":
        return <MisTareas />;
      case "Google Calendario":
        return <GoogleCalendario />;
      case "Chat":
        return <Chat />;
      case "Notificaciones":
        return <Notificaciones />;
      case "Mis Proyectos":
        return <MisProyectos />;
      case "Proyectos Anteriores":
        return <ProyectosAnteriores />;
      case "Opciones":
        return <Opciones />;
      default:
        return <div>Seleccione una vista</div>;
    }
  };

  const isFullScreenView = selectedView === "Chat";

  return (
    <div className="home-container">
      {!isFullScreenView && (
        <NavBar currentView={selectedView} changeView={setSelectedView} />
      )}

      {!isFullScreenView ? (
        <div className="right-container">
          <div className="menu-header">
            <h1>{selectedView}</h1>
          </div>
          <div className="view-container">{renderView()}</div>
        </div>
      ) : (
        <div className="fullscreen-view">{renderView()}</div>
      )}
    </div>
  );

};
