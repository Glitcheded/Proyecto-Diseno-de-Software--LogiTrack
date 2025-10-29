import React, { useState } from "react";
import "./VistaProyectos.css";

import { Listado } from "./Listado";
import { Columnas } from "./Columnas";
import { Calendario } from "./Calendario";
import { Tabla } from "./Tabla";
import { Bitacora } from "./Bitacora";

export const VistaProyectos = ({ ViewMode }) => {
  const [activeViewMode, setActiveViewMode] = useState("Listado");

  let dataList = [];
  if (ViewMode === "Mis Tareas") {
    dataList = [
      {
        id: 1,
        name: "Diseñar interfaz principal",
        project: "Plataforma Web",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-10-25",
        members: ["Giovanni", "Carlos", "Sofía"],
        comments: [
          { author: "Carlos", text: "Voy avanzando con los botones." },
          {
            author: "Giovanni",
            text: "Perfecto, recuerda revisar el color scheme.",
          },
        ],
      },
      {
        id: 2,
        name: "Preparar reunión inicial",
        project: "Plataforma Web",
        state: "Hecho",
        priority: 2,
        dueDate: "2025-10-18",
        members: ["Giovanni", "Sofía"],
        comments: [
          { author: "Sofía", text: "Reunión completada exitosamente." },
        ],
      },
      {
        id: 3,
        name: "Crear mockups",
        project: "App Móvil",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-10-26",
        members: ["Giovanni", "María"],
        comments: [],
      },
      {
        id: 4,
        name: "Diseñar pantalla de login",
        project: "App Móvil",
        state: "Sin iniciar",
        priority: 2,
        dueDate: "2025-10-30",
        members: ["Giovanni"],
        comments: [],
        subtaskOf: 3, // 🔗 Subtarea de "Crear mockups"
      },
      {
        id: 5,
        name: "Actualizar documentación",
        project: "API REST",
        state: "Hecho",
        priority: 3,
        dueDate: "2025-10-10",
        members: ["Giovanni", "Pablo"],
        comments: [{ author: "Pablo", text: "Documentación actualizada." }],
      },
      {
        id: 6,
        name: "Refactorizar controladores",
        project: "API REST",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-10-28",
        members: ["Giovanni", "Pablo", "Andrea"],
        comments: [],
      },
      {
        id: 7,
        name: "Test unitarios",
        project: "API REST",
        state: "Sin iniciar",
        priority: 2,
        dueDate: "2025-11-02",
        members: ["Giovanni", "Andrea"],
        comments: [],
        subtaskOf: 6,
      },
      {
        id: 8,
        name: "Optimizar rendimiento",
        project: "Dashboard",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-10-29",
        members: ["Giovanni", "Sofía"],
        comments: [],
      },
      {
        id: 9,
        name: "Validar endpoints",
        project: "Dashboard",
        state: "Hecho",
        priority: 3,
        dueDate: "2025-10-15",
        members: ["Giovanni"],
        comments: [],
      },
      {
        id: 10,
        name: "Configurar entorno de pruebas",
        project: "API REST",
        state: "En proceso",
        priority: 2,
        dueDate: "2025-10-25",
        members: ["Giovanni", "Pablo"],
        comments: [],
      },
    ];
  } else if (ViewMode === "Mis Proyectos") {
    dataList = [
      {
        id: 1,
        name: "Análisis de requerimientos",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-10-30",
        members: ["Giovanni", "Sofía", "Pablo"],
        comments: [],
      },
      {
        id: 2,
        name: "Desarrollo módulo de pagos",
        state: "En proceso",
        priority: 2,
        dueDate: "2025-11-10",
        members: ["Carlos", "Sofía"],
        comments: [{ author: "Carlos", text: "Integrando Stripe." }],
      },
      {
        id: 3,
        name: "Testing funcional",
        state: "Sin iniciar",
        priority: 3,
        dueDate: "2025-11-18",
        members: ["Giovanni", "María"],
        comments: [],
      },
      {
        id: 4,
        name: "Diseño del dashboard",
        state: "En proceso",
        priority: 2,
        dueDate: "2025-11-02",
        members: ["Sofía"],
        comments: [],
        subtaskOf: 3,
      },
      {
        id: 5,
        name: "Implementar notificaciones",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-10-27",
        members: ["Giovanni", "Carlos"],
        comments: [],
      },
      {
        id: 6,
        name: "Actualizar logo del sitio",
        state: "Hecho",
        priority: 3,
        dueDate: "2025-10-20",
        members: ["María"],
        comments: [],
      },
      {
        id: 7,
        name: "Implementar API externa",
        state: "En proceso",
        priority: 2,
        dueDate: "2025-10-31",
        members: ["Andrea", "Giovanni"],
        comments: [],
      },
      {
        id: 8,
        name: "Optimizar consultas SQL",
        state: "Sin iniciar",
        priority: 3,
        dueDate: "2025-11-05",
        members: ["Carlos"],
        comments: [],
      },
      {
        id: 9,
        name: "Documentar endpoints",
        state: "Hecho",
        priority: 2,
        dueDate: "2025-10-22",
        members: ["Giovanni", "Pablo"],
        comments: [],
      },
      {
        id: 10,
        name: "Integrar autenticación OAuth",
        state: "En proceso",
        priority: 1,
        dueDate: "2025-11-08",
        members: ["Giovanni", "Sofía"],
        comments: [],
      },
    ];
  } else if (ViewMode === "Proyectos Anteriores") {
    dataList = [
      {
        id: 1,
        name: "Migración de base de datos",
        state: "Terminado",
        priority: 2,
        dueDate: "2025-09-15",
        members: ["Carlos", "María"],
        comments: [
          { author: "Carlos", text: "Proyecto cerrado exitosamente." },
        ],
      },
      {
        id: 2,
        name: "Revisión de seguridad",
        state: "Terminado",
        priority: 1,
        dueDate: "2025-08-30",
        members: ["Andrea"],
        comments: [],
      },
      {
        id: 3,
        name: "Optimización de UI",
        state: "Terminado",
        priority: 3,
        dueDate: "2025-09-05",
        members: ["Giovanni", "Sofía"],
        comments: [],
      },
      {
        id: 4,
        name: "Refactorización de código legacy",
        state: "Terminado",
        priority: 2,
        dueDate: "2025-08-15",
        members: ["Carlos", "Pablo"],
        comments: [],
      },
      {
        id: 5,
        name: "Configuración CI/CD",
        state: "Terminado",
        priority: 1,
        dueDate: "2025-09-20",
        members: ["Giovanni", "Sofía"],
        comments: [],
      },
      {
        id: 6,
        name: "Despliegue en producción",
        state: "Terminado",
        priority: 2,
        dueDate: "2025-09-22",
        members: ["Pablo", "Andrea"],
        comments: [],
      },
      {
        id: 7,
        name: "Mejorar logs del sistema",
        state: "Terminado",
        priority: 3,
        dueDate: "2025-08-25",
        members: ["María"],
        comments: [],
      },
      {
        id: 8,
        name: "Auditoría de rendimiento",
        state: "Terminado",
        priority: 2,
        dueDate: "2025-09-10",
        members: ["Giovanni"],
        comments: [],
      },
      {
        id: 9,
        name: "Limpieza de assets antiguos",
        state: "Terminado",
        priority: 3,
        dueDate: "2025-08-18",
        members: ["Sofía"],
        comments: [],
      },
      {
        id: 10,
        name: "Actualizar dependencias",
        state: "Terminado",
        priority: 2,
        dueDate: "2025-09-02",
        members: ["Giovanni", "Carlos"],
        comments: [],
      },
    ];
  }
  const commonProps = { dataList };

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
        return <Bitacora />;
      default:
        return <div>Seleccione una vista</div>;
    }
  };

  return (
    <div className="vista-container">
      <div className="vista-selector">
        <div
          className={
            activeViewMode === "Listado"
              ? "vista-options vista-options-selected"
              : "vista-options"
          }
          onClick={() => setActiveViewMode("Listado")}
        >
          Listado
        </div>
        <div
          className={
            activeViewMode === "Columnas"
              ? "vista-options vista-options-selected"
              : "vista-options"
          }
          onClick={() => setActiveViewMode("Columnas")}
        >
          Columnas
        </div>
        <div
          className={
            activeViewMode === "Calendario"
              ? "vista-options vista-options-selected"
              : "vista-options"
          }
          onClick={() => setActiveViewMode("Calendario")}
        >
          Calendario
        </div>
        <div
          className={
            activeViewMode === "Tabla"
              ? "vista-options vista-options-selected"
              : "vista-options"
          }
          onClick={() => setActiveViewMode("Tabla")}
        >
          Tabla
        </div>
        {ViewMode === "Mis Tareas" ? null : (
          <div
            className={
              activeViewMode === "Bitacora"
                ? "vista-options vista-options-selected"
                : "vista-options"
            }
            onClick={() => setActiveViewMode("Bitacora")}
          >
            Bitácora
          </div>
        )}
      </div>
      <div className="vista-display">{renderSubView()}</div>
    </div>
  );
};
