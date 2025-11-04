import React, { useState, useEffect } from "react";
import "./VistaTareas.css";

import { Listado } from "./Listado";
import { Columnas } from "./Columnas";
import { Calendario } from "./Calendario";
import { Tabla } from "./Tabla";
import { Bitacora } from "./Bitacora";

const baseURL = "http://localhost:3001/api";

export const VistaTareas = ({ ViewMode, selectedProject = null }) => {
  const [activeViewMode, setActiveViewMode] = useState("Listado");

  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    const fetchTareas = async () => {
      try {
        const accessToken = localStorage.getItem("supabaseToken");
        if (!accessToken) {
          console.warn("No access token found.");
          setDataList([]);
          return;
        }

        let url = "";

        if (ViewMode === "Mis Tareas") {
          url = `${baseURL}/tasks/mis-tareas`;
        } else if (selectedProject) {
          url = `${baseURL}/tasks/proyecto/${selectedProject}`;
        } else {
          setDataList([]);
          return;
        }

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener tareas: ${response.statusText}`);
        }

        const result = await response.json();

        console.log("Return data tasks:", { result });

        setDataList(result);
      } catch (error) {
        console.error("Error fetching tareas:", error);
        setDataList([]);
      }
    };

    fetchTareas();
  }, [ViewMode, selectedProject]);

  useEffect(() => {
    console.log("dataList updated:", dataList);
  }, [dataList]);

  const commonProps = { dataList, ViewMode, selectedProject };

  const renderSubView = () => {
    switch (activeViewMode) {
      case "Listado":
        return <Listado {...commonProps} />;
      case "Columnas":
        return <Columnas {...commonProps} />;
      case "Calendario":
        return <Calendario {...commonProps} />;
      case "Tabla":
        return <Tabla {...commonProps} />;
      case "Bitacora":
        return <Bitacora {...commonProps} />;
      default:
        return <div>Seleccione una vista</div>;
    }
  };

  return (
    <div className="vista-container">
      <nav
        className="vista-selector"
        aria-label="Selector de vista de tareas"
        role="tablist"
      >
        {["Listado", "Columnas", "Calendario", "Tabla"].map((view) => (
          <button
            key={view}
            role="tab"
            aria-selected={activeViewMode === view}
            tabIndex={activeViewMode === view ? 0 : -1}
            className={
              activeViewMode === view
                ? "vista-options vista-options-selected"
                : "vista-options"
            }
            onClick={() => setActiveViewMode(view)}
          >
            {view}
          </button>
        ))}

        {ViewMode !== "Mis Tareas" && (
          <button
            key="Bitacora"
            role="tab"
            aria-selected={activeViewMode === "Bitacora"}
            tabIndex={activeViewMode === "Bitacora" ? 0 : -1}
            className={
              activeViewMode === "Bitacora"
                ? "vista-options vista-options-selected"
                : "vista-options"
            }
            onClick={() => setActiveViewMode("Bitacora")}
          >
            Bitácora
          </button>
        )}
      </nav>

      <section
        className="vista-display"
        role="tabpanel"
        aria-label={`Vista actual: ${activeViewMode}`}
      >
        {renderSubView()}
      </section>
    </div>
  );
};
