import React from "react";
import { VistaTareas } from "./subVistas/VistaTareas";

export const MisProyectosSub = ({ selectedProject }) => {
  return (
    <div>
      <VistaTareas ViewMode="Mis Proyectos" selectedProject={selectedProject} />
    </div>
  );
};
