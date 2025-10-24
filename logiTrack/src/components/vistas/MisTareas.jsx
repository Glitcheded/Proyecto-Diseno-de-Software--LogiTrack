import React from "react";
import "./MisTareas.css";

import { VistaProyectos } from "./subVistas/VistaProyectos";

export const MisTareas = () => {
  return (
    <div>
      <VistaProyectos ViewMode="Mis Tareas" />
    </div>
  );
};
