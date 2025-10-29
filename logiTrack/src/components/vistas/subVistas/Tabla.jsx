import React from "react";
import "./Tabla.css";

export const Tabla = ({ dataList }) => {
  if (!dataList || dataList.length === 0) {
    return <div className="tabla-no-data">No hay tareas disponibles</div>;
  }

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 1:
        return "🔴";
      case 2:
        return "🟡";
      case 3:
        return "🟢";
      default:
        return "⚪";
    }
  };

  // Build hierarchy but flatten it for display
  const buildFlatHierarchy = (tasks) => {
    const map = {};
    const flatList = [];

    tasks.forEach((task) => {
      map[task.id] = { ...task, subtasks: [] };
    });

    tasks.forEach((task) => {
      if (task.subtaskOf) {
        map[task.subtaskOf]?.subtasks.push(map[task.id]);
      }
    });

    tasks.forEach((task) => {
      if (!task.subtaskOf) {
        flatList.push(map[task.id]);
        if (map[task.id].subtasks.length > 0) {
          flatList.push(
            ...map[task.id].subtasks.map((sub) => ({
              ...sub,
              parentName: map[task.id].name,
            }))
          );
        }
      }
    });

    return flatList;
  };

  const flatData = buildFlatHierarchy(dataList);

  return (
    <div className="tabla-container">
      <table className="tabla-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Proyecto</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha Entrega</th>
            <th>Integrantes</th>
            <th>Comentarios</th>
          </tr>
        </thead>
        <tbody>
          {flatData.map((task) => (
            <tr
              key={task.id}
              className={`tabla-task-row ${
                task.subtaskOf ? "subtask-row" : ""
              }`}
            >
              <td>
                {task.subtaskOf && (
                  <div className="subtask-label">
                    Subtarea: {task.parentName}
                  </div>
                )}
                {task.name}
              </td>
              <td>{task.project || "-"}</td>
              <td>{getPriorityEmoji(task.priority)}</td>
              <td>{task.state}</td>
              <td>{task.dueDate}</td>
              <td>{task.members.join(", ")}</td>
              <td>
                {task.comments && task.comments.length > 0
                  ? task.comments.map((c, i) => (
                      <div key={i}>
                        <strong>{c.user}:</strong> {c.text}
                      </div>
                    ))
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
