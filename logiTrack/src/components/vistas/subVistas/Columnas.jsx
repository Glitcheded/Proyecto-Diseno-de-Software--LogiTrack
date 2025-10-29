import React, { useState } from "react";
import "./Columnas.css";

export const Columnas = ({ dataList }) => {
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const groupedTasks = {
    "Sin Iniciar": dataList.filter((t) => t.state === "Sin Iniciar"),
    "En Proceso": dataList.filter((t) => t.state === "En proceso"),
    Hecho: dataList.filter((t) => t.state === "Hecho"),
  };

  const getSubtasks = (parentId) =>
    dataList.filter((task) => task.parentId === parentId);

  const renderTask = (task, level = 0) => {
    const subtasks = getSubtasks(task.id);
    const isExpanded = expandedTasks[task.id];
    const priorityColor =
      task.priority === 1 ? "🔴" : task.priority === 2 ? "🟡" : "🟢";

    return (
      <div
        key={task.id}
        className={`task-card level-${level}`}
        onClick={() => toggleExpand(task.id)}
      >
        <div className="task-preview">
          <span className="priority">{priorityColor}</span>
          <span className="task-name">{task.name}</span>
          <span className="task-project">{task.project}</span>
          <span className="task-date">{task.dueDate}</span>
        </div>

        {isExpanded && (
          <div className="task-details" onClick={(e) => e.stopPropagation()}>
            <div>
              <b>Estado:</b> {task.state}
            </div>
            <div>
              <b>Prioridad:</b> {task.priority}
            </div>
            <div>
              <b>Integrantes:</b> {task.members.join(", ")}
            </div>
            <div>
              <b>Comentarios:</b>
              <ul>
                {task.comments.map((c, i) => (
                  <li key={i}>
                    <b>{c.user}:</b> {c.text}
                  </li>
                ))}
              </ul>
            </div>

            {subtasks.length > 0 && (
              <div className="subtasks">
                <b>Subtareas:</b>
                {subtasks.map((sub) => renderTask(sub, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="columnas-container">
      {Object.entries(groupedTasks).map(([state, tasks]) => (
        <div className="column" key={state}>
          <h2>{state}</h2>
          <div className="column-tasks">
            {tasks.filter((t) => !t.parentId).map((task) => renderTask(task))}
          </div>
        </div>
      ))}
    </div>
  );
};
