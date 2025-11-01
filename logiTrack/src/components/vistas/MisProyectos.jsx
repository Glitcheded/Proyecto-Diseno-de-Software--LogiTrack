import React from "react";
import "./MisProyectos.css";
import { VistaProyectos } from "./subVistas/VistaProyectos";

export const MisProyectos = ({ projectList, setProjectList }) => {
  return (
    <div className="mis-proyectos-container">
      <VistaProyectos
        ViewMode="Mis Proyectos"
        dataList={projectList}
        setDataList={setProjectList}
      />
    </div>
  );
};
