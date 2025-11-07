import React from "react";
import { VistaTareas } from "./subVistas/VistaTareas";

export const ProyectosAnterioresSub = ({
  selectedProject,
  selectedProjectName,
  selectedProjectRole,
}) => {
  return (
    <div>
      <VistaTareas
        ViewMode="Proyectos Anteriores"
        selectedProject={selectedProject}
        selectedProjectName={selectedProjectName}
        selectedProjectRole={selectedProjectRole}
      />
    </div>
  );
};
