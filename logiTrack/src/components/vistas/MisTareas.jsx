import React from "react";
import "./MisTareas.css";

import { VistaTareas } from "./subVistas/VistaTareas";

export const MisTareas = () => {
  return (
    <div>
      <VistaTareas ViewMode="Mis Tareas" />
    </div>
  );
};
