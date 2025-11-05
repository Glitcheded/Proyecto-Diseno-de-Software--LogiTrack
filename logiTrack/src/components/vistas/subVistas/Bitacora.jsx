import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Bitacora.css";

const baseURL = "http://localhost:3001/api/projects";

export const Bitacora = ({
  ViewMode,
  selectedProject,
  selectedProjectName,
}) => {
  const today = new Date();
  const formatDate = (date) => date.toISOString().split("T")[0];
  const [viewDate, setViewDate] = useState(formatDate(today));
  const [dataList, setDataList] = useState([]);

  const fetchBitacoraEntries = async (projectId, date) => {
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found");
        setDataList([]);
        return;
      }

      const response = await fetch(`${baseURL}/${projectId}/${date}/entries`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching entries: ${response.statusText}`);
      }

      const data = await response.json();
      setDataList(data);
    } catch (error) {
      console.error("Failed to fetch bitacora entries:", error);
      setDataList([]);
    }
  };

  // Fetch entries whenever selectedProject or viewDate changes
  useEffect(() => {
    if (selectedProject) {
      fetchBitacoraEntries(selectedProject, viewDate);
    }
  }, [selectedProject, viewDate]);

  const handleChange = async (id, field, value) => {
    // 1️⃣ Update UI immediately for responsiveness
    setDataList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    // 2️⃣ Send update to backend
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found");
        return;
      }

      // Map frontend field names to database columns
      const fieldMap = {
        startTime: "horaInicio",
        finishTime: "horaFinalizacion",
        tasks: "tareas",
        notes: "notas",
      };

      // If the field doesn’t match one of these, ignore
      if (!fieldMap[field]) {
        console.warn(`Unknown field: ${field}`);
        return;
      }

      const payload = {
        [fieldMap[field]]: value,
      };

      const response = await fetch(`${baseURL}/entrada/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error updating entry: ${response.statusText}`);
      }

      const updated = await response.json();

      // Optional: re-sync local state with the updated server data
      setDataList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
    } catch (error) {
      console.error("Failed to update bitacora entry:", error);
      alert("No se pudo actualizar la entrada. Intenta nuevamente.");
    }
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

  const handleAddEntry = async () => {
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found");
        return;
      }

      // Make the POST request to your new route
      const response = await fetch(
        `${baseURL}/${selectedProject}/${viewDate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error al crear la entrada: ${response.statusText}`);
      }

      const newEntry = await response.json();

      // Add the new entry to the state list
      setDataList((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error("Error al agregar nueva entrada:", error);
      alert("No se pudo crear la entrada. Intenta nuevamente.");
    }
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

    doc.text(`Bitácora - ${selectedProjectName} - ${viewDate}`, 14, 15);
    autoTable(doc, {
      head: [["Hora", "Tareas", "Notas"]],
      body: tableData,
      startY: 20,
    });

    doc.save(`bitacora-${selectedProjectName}-${viewDate}.pdf`);
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
                      onClick={() => {
                        if (item.finishTime) {
                          // If there's already a finish time → remove it
                          handleChange(item.id, "finishTime", null);
                        } else {
                          // Otherwise, set it to the *local* current time (HH:mm:00)
                          const now = new Date();
                          const hours = String(now.getHours()).padStart(2, "0");
                          const minutes = String(now.getMinutes()).padStart(
                            2,
                            "0"
                          );
                          const localTime = `${hours}:${minutes}:00`;

                          handleChange(item.id, "finishTime", localTime);
                        }
                      }}
                      aria-label={
                        item.finishTime
                          ? "Eliminar hora de fin"
                          : "Agregar hora de fin"
                      }
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (item.finishTime) {
                            handleChange(item.id, "finishTime", null);
                          } else {
                            const now = new Date();
                            const hours = String(now.getHours()).padStart(
                              2,
                              "0"
                            );
                            const minutes = String(now.getMinutes()).padStart(
                              2,
                              "0"
                            );
                            const localTime = `${hours}:${minutes}:00`;

                            handleChange(item.id, "finishTime", localTime);
                          }
                        }
                      }}
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
