import React from "react";
import "./MisProyectos.css";

import { VistaProyectos } from "./subVistas/VistaProyectos";

export const MisProyectos = () => {
  return (
    <div>
      <VistaProyectos ViewMode="Mis Proyectos" />
    </div>
  );
};
