import React from "react";
import { VistaTareas } from "./subVistas/VistaTareas";

export const ProyectosAnterioresSub = ({ selectedProject }) => {
  return (
    <div>
      <VistaTareas
        ViewMode="Proyectos Anteriores"
        selectedProject={selectedProject}
      />
    </div>
  );
};
