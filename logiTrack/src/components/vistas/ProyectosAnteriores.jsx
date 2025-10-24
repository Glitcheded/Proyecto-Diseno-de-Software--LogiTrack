import React from "react";
import "./ProyectosAnteriores.css";

import { VistaProyectos } from "./subVistas/VistaProyectos";

export const ProyectosAnteriores = () => {
  return (
    <div>
      <VistaProyectos ViewMode="Proyectos Anteriores" />
    </div>
  );
};
