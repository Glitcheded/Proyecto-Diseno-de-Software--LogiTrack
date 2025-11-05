import React from "react";
import { VistaTareas } from "./subVistas/VistaTareas";

export const MisProyectosSub = ({ selectedProject, selectedProjectName }) => {
  return (
    <div>
      <VistaTareas
        ViewMode="Mis Proyectos"
        selectedProject={selectedProject}
        selectedProjectName={selectedProjectName}
      />
    </div>
  );
};
