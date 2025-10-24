import React, { useState } from "react";
import { NavBar } from "./NavBar";
import "./Home.css";

import { MisTareas } from "./vistas/MisTareas";
import { Calendario } from "./vistas/Calendario";
import { Chat } from "./vistas/Chat";
import { Notificaciones } from "./vistas/Notificaciones";
import { MisProyectos } from "./vistas/MisProyectos";
import { ProyectosAnteriores } from "./vistas/ProyectosAnteriores";

export const Home = () => {
  const [selectedView, setSelectedView] = useState("Mis Tareas");

  const renderView = () => {
    switch (selectedView) {
      case "Mis Tareas":
        return <MisTareas />;
      case "Calendario":
        return <Calendario />;
      case "Chat":
        return <Chat />;
      case "Notificaciones":
        return <Notificaciones />;
      case "Mis Proyectos":
        return <MisProyectos />;
      case "Proyectos Anteriores":
        return <ProyectosAnteriores />;
      default:
        return <div>Seleccione una vista</div>;
    }
  };

  return (
    <div className="home-container">
      <NavBar currentView={selectedView} changeView={setSelectedView} />
      <div className="right-container">
        <div className="menu-header">
          <h1>{selectedView}</h1>
        </div>
        <div className="view-container">{renderView()}</div>
      </div>
    </div>
  );
};
