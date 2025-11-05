import React from "react";
import { VistaTareas } from "./subVistas/VistaTareas";

export const ProyectosAnterioresSub = ({
  selectedProject,
  selectedProjectName,
}) => {
  return (
    <div>
      <VistaTareas
        ViewMode="Proyectos Anteriores"
        selectedProject={selectedProject}
        selectedProjectName={selectedProjectName}
      />
    </div>
  );
};
