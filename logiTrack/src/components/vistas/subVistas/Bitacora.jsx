import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Bitacora.css";

const baseURL = "http://localhost:3001/api";

export const Bitacora = ({ ViewMode, selectedProject }) => {
  const today = new Date();
  const formatDate = (date) => date.toISOString().split("T")[0];
  const [viewDate, setViewDate] = useState(formatDate(today));
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    let tempList = [];

    if (ViewMode === "Mis Proyectos" && viewDate === "2025-11-01") {
      tempList = [
        {
          id: 1,
          startTime: "08:00",
          finishTime: "10:00",
          tasks: "Revisión de requerimientos del cliente.",
          notes: "Cliente pidió incluir un nuevo módulo de reportes.",
        },
        {
          id: 2,
          startTime: "10:30",
          finishTime: "12:00",
          tasks: "Diseño del esquema de base de datos.",
          notes: "Estructura inicial creada en PostgreSQL.",
        },
        {
          id: 3,
          startTime: "14:00",
          tasks: "Revisión de wireframes.",
          notes: "Pendiente revisión con equipo de UI/UX.",
        },
      ];
    } else if (ViewMode === "Mis Proyectos" && viewDate === "2025-11-02") {
      tempList = [
        {
          id: 4,
          startTime: "09:00",
          finishTime: "10:45",
          tasks: "Implementación del módulo de autenticación.",
          notes: "Inicio de sesión funcional con tokens JWT.",
        },
        {
          id: 5,
          startTime: "11:15",
          finishTime: "12:45",
          tasks: "Conexión al servidor de pruebas.",
          notes: "Servidor responde correctamente a peticiones POST.",
        },
        {
          id: 6,
          startTime: "15:00",
          tasks: "Revisión de endpoints REST.",
          notes: "Pendiente optimización de consultas.",
        },
      ];
    } else if (ViewMode === "Mis Proyectos" && viewDate === "2025-11-03") {
      tempList = [
        {
          id: 7,
          startTime: "08:30",
          finishTime: "09:45",
          tasks: "Pruebas unitarias del backend.",
          notes: "Cubrimiento del 65% de código.",
        },
        {
          id: 8,
          startTime: "10:00",
          finishTime: "12:00",
          tasks: "Optimización de consultas SQL.",
          notes: "Mejorado el rendimiento en un 30%.",
        },
        {
          id: 9,
          startTime: "13:30",
          tasks: "Revisión con QA.",
          notes: "Identificados tres errores menores en validaciones.",
        },
      ];
    } else if (
      ViewMode === "Proyectos Anteriores" &&
      viewDate === "2025-11-01"
    ) {
      tempList = [
        {
          id: 10,
          startTime: "09:00",
          finishTime: "10:30",
          tasks: "Evaluación postmortem del proyecto CRM.",
          notes: "Proyecto finalizado exitosamente.",
        },
        {
          id: 11,
          startTime: "11:00",
          tasks: "Actualización del changelog final.",
          notes: "Incluye mejoras aplicadas en última iteración.",
        },
        {
          id: 12,
          startTime: "15:00",
          finishTime: "16:45",
          tasks: "Limpieza del repositorio.",
          notes: "Archivos antiguos eliminados correctamente.",
        },
      ];
    } else if (
      ViewMode === "Proyectos Anteriores" &&
      viewDate === "2025-11-02"
    ) {
      tempList = [
        {
          id: 13,
          startTime: "08:15",
          finishTime: "09:45",
          tasks: "Revisión de documentación de despliegue.",
          notes: "Procedimientos actualizados para versión 2.0.",
        },
        {
          id: 14,
          startTime: "10:30",
          finishTime: "12:15",
          tasks: "Validación de respaldos.",
          notes: "Backups confirmados en S3.",
        },
        {
          id: 15,
          startTime: "14:00",
          tasks: "Archivo de logs antiguos.",
          notes: "Almacenados en archivo comprimido ZIP.",
        },
      ];
    } else if (
      ViewMode === "Proyectos Anteriores" &&
      viewDate === "2025-11-03"
    ) {
      tempList = [
        {
          id: 16,
          startTime: "09:00",
          finishTime: "10:00",
          tasks: "Revisión de métricas finales del sistema.",
          notes: "CPU usage reducido un 15% tras refactorización.",
        },
        {
          id: 17,
          startTime: "10:30",
          finishTime: "12:00",
          tasks: "Análisis del feedback del cliente.",
          notes: "Comentarios positivos sobre la interfaz.",
        },
        {
          id: 18,
          startTime: "13:45",
          tasks: "Cierre del ticket de soporte.",
          notes: "Último error de sesión corregido.",
        },
      ];
    }

    setDataList(tempList);
  }, [ViewMode, viewDate]);

  const handleChange = (id, field, value) => {
    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const toggleFinishTime = (id) => {
    setDataList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, finishTime: item.finishTime ? undefined : "00:00" }
          : item
      )
    );
  };

  const handleAddEntry = () => {
    const newEntry = {
      id: Date.now(),
      startTime: "00:00",
      tasks: "",
      notes: "",
    };
    setDataList((prev) => [...prev, newEntry]);
  };

  const editable = ViewMode === "Mis Proyectos";

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const tableData = dataList.map((item) => [
      item.finishTime
        ? `${item.startTime} - ${item.finishTime}`
        : item.startTime,
      item.tasks,
      item.notes,
    ]);

    doc.text(`Bitácora - ${ViewMode} - ${viewDate}`, 14, 15);
    autoTable(doc, {
      head: [["Hora", "Tareas", "Notas"]],
      body: tableData,
      startY: 20,
    });

    doc.save(`bitacora-${ViewMode}-${viewDate}.pdf`);
  };

  return (
    <div
      className="bitacora-wrapper"
      role="region"
      aria-label={`Bitácora - ${ViewMode}`}
    >
      <div className="bitacora-header">
        <label htmlFor="datePicker">
          <strong>Seleccionar fecha:</strong>
        </label>
        <input
          id="datePicker"
          type="date"
          value={viewDate}
          onChange={(e) => setViewDate(e.target.value)}
          aria-label="Seleccionar fecha para la bitácora"
        />
        <button
          className="generate-btn"
          onClick={handleGeneratePDF}
          aria-label={`Generar reporte PDF de la bitácora para ${viewDate}`}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleGeneratePDF()}
        >
          Generar Reporte
        </button>
      </div>

      <table
        className="bitacora-table"
        role="table"
        aria-label="Tabla de bitácora diaria"
      >
        <thead>
          <tr role="row">
            <th role="columnheader">Hora</th>
            <th role="columnheader">Tareas</th>
            <th role="columnheader">Notas</th>
          </tr>
        </thead>
        <tbody>
          {dataList.map((item) => (
            <tr key={item.id} role="row">
              <td role="cell">
                {editable ? (
                  <div className="time-column">
                    <label className="sr-only" htmlFor={`start-${item.id}`}>
                      Hora de inicio
                    </label>
                    <input
                      id={`start-${item.id}`}
                      type="time"
                      value={item.startTime}
                      onChange={(e) =>
                        handleChange(item.id, "startTime", e.target.value)
                      }
                      aria-label="Hora de inicio"
                    />
                    {item.finishTime && (
                      <>
                        <label
                          className="sr-only"
                          htmlFor={`finish-${item.id}`}
                        >
                          Hora de fin
                        </label>
                        <input
                          id={`finish-${item.id}`}
                          type="time"
                          value={item.finishTime}
                          onChange={(e) =>
                            handleChange(item.id, "finishTime", e.target.value)
                          }
                          aria-label="Hora de fin"
                        />
                      </>
                    )}
                    <button
                      className="bitacora-finish-btn"
                      onClick={() => toggleFinishTime(item.id)}
                      aria-label={
                        item.finishTime
                          ? "Eliminar hora de fin"
                          : "Agregar hora de fin"
                      }
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && toggleFinishTime(item.id)
                      }
                    >
                      {item.finishTime ? "Eliminar fin" : "Agregar fin"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div>
                      <strong>
                        {item.finishTime ? "Inicio" : "Realizado"}:
                      </strong>{" "}
                      {item.startTime}
                    </div>
                    {item.finishTime && (
                      <div>
                        <strong>Fin:</strong> {item.finishTime}
                      </div>
                    )}
                  </div>
                )}
              </td>

              <td role="cell">
                {editable ? (
                  <textarea
                    value={item.tasks}
                    onChange={(e) =>
                      handleChange(item.id, "tasks", e.target.value)
                    }
                    aria-label="Tareas realizadas"
                  />
                ) : (
                  item.tasks
                )}
              </td>

              <td role="cell">
                {editable ? (
                  <textarea
                    value={item.notes}
                    onChange={(e) =>
                      handleChange(item.id, "notes", e.target.value)
                    }
                    aria-label="Notas adicionales"
                  />
                ) : (
                  item.notes
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editable && (
        <div className="add-row">
          <button
            className="add-btn"
            onClick={handleAddEntry}
            aria-label="Agregar nueva entrada a la bitácora"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleAddEntry()}
          >
            ➕ Agregar entrada
          </button>
        </div>
      )}
    </div>
  );
};
