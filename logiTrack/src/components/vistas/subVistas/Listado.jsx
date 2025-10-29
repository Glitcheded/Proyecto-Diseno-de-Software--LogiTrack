import React, { useState } from "react";
import "./Listado.css";

export const Listado = ({ dataList }) => {
  if (!dataList || dataList.length === 0) {
    return <div className="no-data">No hay tareas disponibles</div>;
  }
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

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

  const buildHierarchy = (tasks) => {
    const map = {};
    const roots = [];

    tasks.forEach((task) => {
      map[task.id] = { ...task, subtasks: [] };
    });

    tasks.forEach((task) => {
      if (task.subtaskOf) {
        map[task.subtaskOf]?.subtasks.push(map[task.id]);
      } else {
        roots.push(map[task.id]);
      }
    });

    return roots;
  };

  const renderTaskRow = (task, level = 0) => {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isExpanded = expandedTasks[task.id];

    return (
      <React.Fragment key={task.id}>
        <tr className={`task-row level-${level}`}>
          <td>
            <div className="task-name">
              {hasSubtasks && (
                <span
                  className="dropdown-toggle"
                  onClick={() => toggleExpand(task.id)}
                >
                  {isExpanded ? "▼" : "▶"}
                </span>
              )}
              <span className="task-text">{task.name}</span>
            </div>
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

        {hasSubtasks && isExpanded && (
          <>{task.subtasks.map((sub) => renderTaskRow(sub, level + 1))}</>
        )}
      </React.Fragment>
    );
  };

  const hierarchicalData = buildHierarchy(dataList);

  return (
    <div className="listado-container">
      <table className="listado-table">
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
        <tbody>{hierarchicalData.map((task) => renderTaskRow(task))}</tbody>
      </table>
    </div>
  );
};
