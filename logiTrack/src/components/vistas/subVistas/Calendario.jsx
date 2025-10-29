import React, { useState } from "react";
import "./Calendario.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export const Calendario = ({ dataList }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedTask, setSelectedTask] = useState(null);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const firstDay = new Date(currentYear, currentMonth, 1).getDay() || 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
    if (currentMonth === 0) setCurrentYear(currentYear - 1);
  };

  const nextMonth = () => {
    setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
    if (currentMonth === 11) setCurrentYear(currentYear + 1);
  };

  const getTasksForDay = (day) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return dataList.filter((task) => task.dueDate.startsWith(dateString));
  };

  const renderDayCells = () => {
    const cells = [];
    for (let i = 1; i < firstDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className="calendar-cell empty"></div>
      );
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const tasks = getTasksForDay(day);
      cells.push(
        <div key={day} className="calendar-cell">
          <div className="day-number">{day}</div>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="task-card"
              onClick={() => handleTaskClick(task)}
            >
              <div className="task-preview">
                <div className="task-name">
                  {task.name}{" "}
                  {task.priority === 1
                    ? "🔴"
                    : task.priority === 2
                    ? "🟡"
                    : "🟢"}
                </div>
                <div className="task-project">{task.project}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <FontAwesomeIcon
          icon={faChevronLeft}
          className="arrow-btn"
          onClick={prevMonth}
        />
        <div className="month-selector">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
          >
            {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              )
            )}
          </select>
        </div>
        <FontAwesomeIcon
          icon={faChevronRight}
          className="arrow-btn"
          onClick={nextMonth}
        />
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map((d) => (
          <div key={d} className="calendar-day-header">
            {d}
          </div>
        ))}
        {renderDayCells()}
      </div>
      {selectedTask && (
        <div className="task-detail-panel">
          <button className="close-btn" onClick={() => setSelectedTask(null)}>
            ✖
          </button>
          <h3>{selectedTask.name}</h3>
          <p>
            <strong>Proyecto:</strong> {selectedTask.project}
          </p>
          <p>
            <strong>Prioridad:</strong> {selectedTask.priority}
          </p>
          <p>
            <strong>Estado:</strong> {selectedTask.state}
          </p>
          <p>
            <strong>Fecha de entrega:</strong> {selectedTask.dueDate}
          </p>
          <p>
            <strong>Integrantes:</strong> {selectedTask.members.join(", ")}
          </p>
          <p>
            <strong>Comentarios:</strong>
          </p>
          <ul>
            {Array.isArray(selectedTask.comments) ? (
              selectedTask.comments.map((comment, i) => (
                <li key={i}>
                  <strong>{comment.author}:</strong> {comment.text}
                </li>
              ))
            ) : (
              <li>No hay comentarios</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
