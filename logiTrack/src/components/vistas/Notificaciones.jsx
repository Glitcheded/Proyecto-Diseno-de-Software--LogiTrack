import React, { useState } from "react";
import "./Notificaciones.css";

export const Notificaciones = () => {
  const [dataList, setDataList] = useState([
    {
      id: 1,
      message: "Tarea completada: Diseño de interfaz",
      date: "2025-11-01",
      time: "08:30",
    },
    {
      id: 2,
      message: "Nuevo comentario en proyecto API REST",
      date: "2025-11-01",
      time: "09:15",
    },
    {
      id: 3,
      message: "Actualización de documentación finalizada",
      date: "2025-11-02",
      time: "10:00",
    },
    {
      id: 4,
      message: "Recordatorio: reunión de equipo",
      date: "2025-11-02",
      time: "11:45",
    },
    {
      id: 5,
      message: "Error detectado en servidor de pruebas",
      date: "2025-11-02",
      time: "13:20",
    },
    {
      id: 6,
      message: "Entrega de mockups aprobada",
      date: "2025-11-03",
      time: "08:50",
    },
    {
      id: 7,
      message: "Nueva tarea asignada: Optimización SQL",
      date: "2025-11-03",
      time: "09:30",
    },
    {
      id: 8,
      message: "Feedback recibido de QA",
      date: "2025-11-03",
      time: "14:10",
    },
    {
      id: 9,
      message: "Actualización de estado: Backend en progreso",
      date: "2025-11-03",
      time: "15:00",
    },
    {
      id: 10,
      message: "Recordatorio: cierre de sprint",
      date: "2025-11-03",
      time: "16:30",
    },
    {
      id: 11,
      message: "Nueva tarea asignada: Documentación API",
      date: "2025-11-04",
      time: "09:00",
    },
    {
      id: 12,
      message: "Revisión de pull request #45",
      date: "2025-11-04",
      time: "10:15",
    },
    {
      id: 13,
      message: "Actualización de servidor de pruebas completada",
      date: "2025-11-04",
      time: "11:30",
    },
    {
      id: 14,
      message: "Recordatorio: reunión de planificación",
      date: "2025-11-04",
      time: "13:00",
    },
    {
      id: 15,
      message: "Error detectado en módulo de pagos",
      date: "2025-11-05",
      time: "08:45",
    },
    {
      id: 16,
      message: "Entrega de prototipo aprobada",
      date: "2025-11-05",
      time: "09:30",
    },
    {
      id: 17,
      message: "Feedback recibido de equipo QA",
      date: "2025-11-05",
      time: "11:00",
    },
    {
      id: 18,
      message: "Actualización de estado: Dashboard en progreso",
      date: "2025-11-05",
      time: "12:45",
    },
    {
      id: 19,
      message: "Recordatorio: reunión de cierre de sprint",
      date: "2025-11-05",
      time: "14:30",
    },
    {
      id: 20,
      message: "Nueva tarea asignada: Optimización consultas SQL",
      date: "2025-11-05",
      time: "15:15",
    },
  ]);

  const handleDelete = (id) => {
    setDataList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div
      className="notificaciones-wrapper"
      role="region"
      aria-label="Lista de notificaciones"
    >
      <table
        className="notificaciones-table"
        role="table"
        aria-label="Tabla de notificaciones"
      >
        <thead>
          <tr role="row">
            <th role="columnheader" className="message-col">
              Mensaje
            </th>
            <th role="columnheader">Fecha</th>
            <th role="columnheader">Hora</th>
            <th role="columnheader">Acción</th>
          </tr>
        </thead>
        <tbody>
          {dataList.length > 0 ? (
            dataList.map((item) => (
              <tr key={item.id} role="row">
                <td role="cell" className="message-col">
                  {item.message}
                </td>
                <td role="cell">{item.date}</td>
                <td role="cell">{item.time}</td>
                <td role="cell">
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Acción eliminar notificación: ${item.message}`}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleDelete(item.id)
                    }
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr role="row">
              <td
                colSpan="4"
                role="cell"
                style={{ textAlign: "center", padding: "1rem" }}
              >
                No hay notificaciones
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
