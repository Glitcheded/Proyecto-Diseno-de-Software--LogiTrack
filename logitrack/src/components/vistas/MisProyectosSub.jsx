import React from "react";
import { VistaTareas } from "./subVistas/VistaTareas";

export const MisProyectosSub = ({
  selectedProject,
  selectedProjectName,
  selectedProjectRole,
}) => {
  return (
    <div>
      <VistaTareas
        ViewMode="Mis Proyectos"
        selectedProject={selectedProject}
        selectedProjectName={selectedProjectName}
        selectedProjectRole={selectedProjectRole}
      />
    </div>
  );
};
