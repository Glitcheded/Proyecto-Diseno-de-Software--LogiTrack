import React, { useState, useEffect } from "react";
import "./Notificaciones.css";
import { useUser } from "../../context/UserContext";

const baseURL = "http://localhost:3001";

export const Notificaciones = () => {
  const [dataList, setDataList] = useState([]);
  const { userEmail } = useUser();

  const fetchNotificaciones = async () => {
    const token = localStorage.getItem("supabaseToken");

    try {
      const res = await fetch(
        `${baseURL}/api/notificacion/notificaciones/${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setDataList(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [userEmail]);

  useEffect(() => {
    console.log("Mis notificaciones: ", dataList);
  }, [dataList]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("supabaseToken");
      if (!token) {
        console.warn("No token found, please log in again.");
        return;
      }

      const res = await fetch(`${baseURL}/api/notificacion/desactivar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Error al desactivar notificación:", errText);
        return;
      }

      setDataList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
    }
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
