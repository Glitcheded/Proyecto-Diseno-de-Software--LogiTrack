import React, { useState, useEffect } from "react";
import "./Calendario.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

export const Calendario = ({ dataList, ViewMode, selectedProject }) => {
  const [tasks, setTasks] = useState(() =>
    Array.isArray(dataList) ? dataList.slice() : []
  );
  const [editingTask, setEditingTask] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [commentsTask, setCommentsTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const getParentName = (task) => {
    if (!task.subtaskOf) return null;
    const parent = tasks.find((t) => t.id === task.subtaskOf);
    return parent ? parent.name : null;
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

  useEffect(() => {
    if (!editingTask) return;

    const fetchProjectMembers = async () => {
      try {
        const response = await new Promise((resolve) =>
          setTimeout(
            () =>
              resolve([
                "Giovanni",
                "Laura",
                "Carlos",
                "Ana",
                "María",
                "José",
                "David",
                "Sofía",
                "Pablo",
                "Andrea",
              ]),
            200
          )
        );

        const sorted = response.sort((a, b) => {
          const aIsMember = editingTask?.members?.includes(a);
          const bIsMember = editingTask?.members?.includes(b);
          return aIsMember === bIsMember ? 0 : aIsMember ? -1 : 1;
        });

        setAvailableMembers(sorted);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };

    fetchProjectMembers();
  }, [editingTask]);

  const today = new Date();
  const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
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
    return tasks.filter((task) => task.dueDate.startsWith(dateString));
  };

  const handleAddSubtask = (parentId) => {
    const parent = tasks.find((t) => t.id === parentId);
    const newTask = {
      id: makeId(),
      name: "Nueva subtarea",
      project: parent?.project || "-",
      priority: 2,
      state: "Sin iniciar",
      dueDate: new Date().toISOString().slice(0, 10),
      members: parent ? [...parent.members] : [],
      comments: [],
      subtaskOf: parentId,
    };
    setTasks((prev) => [...prev, newTask]);
    setEditingTask({ ...newTask });
    setIsEditorOpen(true);
  };

  const openEditor = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setEditingTask({ ...t });
    setIsEditorOpen(true);
  };

  const saveEdits = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === editingTask.id ? { ...t, ...editingTask } : t))
    );
    setIsEditorOpen(false);
    setEditingTask(null);
  };

  const cancelEdits = () => {
    setIsEditorOpen(false);
    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    if (!confirm("¿Eliminar tarea? Esta acción no se puede deshacer.")) return;

    const toRemove = new Set([taskId]);
    let foundMore = true;
    while (foundMore) {
      foundMore = false;
      tasks.forEach((t) => {
        if (t.subtaskOf && toRemove.has(t.subtaskOf) && !toRemove.has(t.id)) {
          toRemove.add(t.id);
          foundMore = true;
        }
      });
    }

    setTasks((prev) => prev.filter((t) => !toRemove.has(t.id)));
    setIsEditorOpen(false);
    setEditingTask(null);
  };

  const handleTaskClick = (task) => setSelectedTask(task);

  const openComments = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setCommentsTask({ ...t });
    setNewCommentText("");
  };

  const sendComment = () => {
    if (!commentsTask || !newCommentText.trim()) return;
    const comment = { author: "Giovanni", text: newCommentText.trim() };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === commentsTask.id
          ? { ...t, comments: [comment, ...(t.comments || [])] }
          : t
      )
    );

    setCommentsTask((prev) => ({
      ...prev,
      comments: [comment, ...(prev.comments || [])],
    }));

    setNewCommentText("");
  };

  const handleAddTaskForDay = (day) => {
    const year = currentYear;
    const month = currentMonth;
    const dueDate = new Date(year, month, day).toISOString().slice(0, 10);

    const newTask = {
      id: makeId(),
      name: "Nueva tarea",
      project: "-",
      priority: 2,
      state: "Sin iniciar",
      dueDate,
      members: [],
      comments: [],
      subtaskOf: null,
    };

    setTasks((prev) => [...prev, newTask]);
    setEditingTask({ ...newTask });
    setIsEditorOpen(true);
  };

  const renderDayCells = () => {
    const cells = [];

    for (let i = 1; i < firstDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className="calendar-cell empty"></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const tasksForDay = getTasksForDay(day);

      cells.push(
        <div key={day} className="calendar-cell">
          <div className="day-header">
            <div className="day-number">{day}</div>
            {ViewMode === "Mis Proyectos" && (
              <button
                className="add-task-day-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTaskForDay(day);
                }}
                title="Agregar tarea para este día"
              >
                ➕
              </button>
            )}
          </div>

          {tasksForDay.map((task) => (
            <div
              key={task.id}
              className="task-card"
              onClick={() => handleTaskClick(task)}
            >
              <div className="task-preview">
                {ViewMode !== "Proyectos Anteriores" && (
                  <button
                    className="edit-btn-col"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditor(task.id);
                    }}
                    title="Editar tarea"
                  >
                    Editar
                  </button>
                )}

                {Boolean(task.subtaskOf) && (
                  <div className="subtask-label">
                    Subtarea: <b>{getParentName(task)}</b>
                  </div>
                )}
                <div className="task-name">
                  {task.name} {getPriorityEmoji(task.priority)}
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
          {Boolean(selectedTask.subtaskOf) && (
            <p>
              <strong>Subtarea de: </strong>
              {getParentName(selectedTask)}
            </p>
          )}
          {ViewMode === "Mis Tareas" && (
            <p>
              <strong>Proyecto:</strong> {selectedTask.project}
            </p>
          )}

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

          <div className="comments-section">
            <b>Comentarios:</b>
            {Array.isArray(selectedTask.comments) &&
            selectedTask.comments.length > 0 ? (
              <>
                <ul>
                  {selectedTask.comments.slice(0, 1).map((c, i) => (
                    <li key={i}>
                      <b>{c.author}:</b> {c.text}
                    </li>
                  ))}
                </ul>
                <button
                  className="comment-preview"
                  onClick={(e) => {
                    e.stopPropagation();
                    openComments(selectedTask.id);
                  }}
                  title="Ver todos los comentarios"
                >
                  Ver todos los comentarios
                </button>
              </>
            ) : (
              <div className="no-comments-cell">
                <span className="no-comment-text">Sin comentarios</span>
                {ViewMode !== "Proyectos Anteriores" && (
                  <button
                    className="add-comment-btn-columnas"
                    onClick={(e) => {
                      e.stopPropagation();
                      openComments(selectedTask.id);
                    }}
                    title="Agregar comentario"
                  >
                    💬
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {isEditorOpen && editingTask && (
        <div className="modal-overlay" onClick={cancelEdits}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar tarea</h3>

            <label>
              Nombre
              <input
                type="text"
                value={editingTask.name}
                onChange={(e) =>
                  setEditingTask((p) => ({ ...p, name: e.target.value }))
                }
              />
            </label>

            <label>
              Prioridad
              <select
                value={editingTask.priority}
                onChange={(e) =>
                  setEditingTask((p) => ({
                    ...p,
                    priority: Number(e.target.value),
                  }))
                }
              >
                <option value={1}>🔴 1</option>
                <option value={2}>🟡 2</option>
                <option value={3}>🟢 3</option>
              </select>
            </label>

            <label>
              Estado
              <select
                value={editingTask.state}
                onChange={(e) =>
                  setEditingTask((p) => ({ ...p, state: e.target.value }))
                }
              >
                <option value="Hecho">Hecho</option>
                <option value="En proceso">En proceso</option>
                <option value="Sin iniciar">Sin iniciar</option>
              </select>
            </label>

            <label>
              Fecha de entrega
              <input
                type="date"
                value={editingTask.dueDate}
                onChange={(e) =>
                  setEditingTask((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </label>

            <label>
              Integrantes
              <div className="members-list">
                {availableMembers.map((member) => {
                  const isMember = editingTask.members?.includes(member);
                  return (
                    <div key={member} className="member-item">
                      <span>{member}</span>
                      <button
                        className="small"
                        onClick={() => {
                          setEditingTask((prev) => ({
                            ...prev,
                            members: isMember
                              ? prev.members.filter((m) => m !== member)
                              : [...(prev.members || []), member],
                          }));
                        }}
                      >
                        {isMember ? "-" : "+"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </label>

            <div className="modal-actions">
              <button onClick={saveEdits} className="confirm">
                Confirmar
              </button>
              <button onClick={cancelEdits} className="cancel">
                Cancelar
              </button>
              <button
                onClick={() => deleteTask(editingTask.id)}
                className="danger"
              >
                Eliminar
              </button>
              <button
                onClick={() => handleAddSubtask(editingTask.id)}
                className="subtask"
              >
                Agregar subtarea
              </button>
            </div>
          </div>
        </div>
      )}

      {commentsTask && (
        <div className="modal-overlay" onClick={() => setCommentsTask(null)}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Comentarios</h3>

            <div className="comments-list">
              {Array.isArray(commentsTask.comments) &&
              commentsTask.comments.length ? (
                commentsTask.comments.map((c, i) => (
                  <div className="comment-item" key={i}>
                    <strong>{c.author}:</strong> <span>{c.text}</span>
                  </div>
                ))
              ) : (
                <div>No hay comentarios</div>
              )}
            </div>

            {ViewMode !== "Proyectos Anteriores" && (
              <div className="add-comment">
                <input
                  placeholder="Escribe un comentario..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                />
                <button onClick={sendComment}>Enviar</button>
              </div>
            )}

            <div style={{ marginTop: 8, textAlign: "right" }}>
              <button onClick={() => setCommentsTask(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
