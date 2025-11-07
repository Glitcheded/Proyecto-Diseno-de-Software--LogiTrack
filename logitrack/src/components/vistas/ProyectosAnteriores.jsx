import React from "react";
import "./ProyectosAnteriores.css";
import { VistaProyectos } from "./subVistas/VistaProyectos";

export const ProyectosAnteriores = ({
  projectList,
  setProjectList,
  fetchProjects,
}) => {
  return (
    <div className="proyectos-anteriores-container">
      <VistaProyectos
        ViewMode="Proyectos Anteriores"
        dataList={projectList}
        setDataList={setProjectList}
        fetchProjects={fetchProjects}
      />
    </div>
  );
};
