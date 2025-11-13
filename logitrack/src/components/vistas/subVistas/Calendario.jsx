import React, { useState, useEffect, useRef } from "react";
import "./Calendario.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api`;

export const Calendario = ({
  dataList,
  ViewMode,
  selectedProject,
  fetchTareas,
  selectedProjectRole,
}) => {
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

  const getPriorityEmoji = (prioridad) => {
    if (!prioridad || !prioridad.nivel) return "⚪";

    switch (prioridad.nivel.toLowerCase()) {
      case "alta":
        return "🔴";
      case "media":
        return "🟡";
      case "baja":
        return "🟢";
      default:
        return "⚪";
    }
  };

    // ******************************************************
    const refModalEditarTarea = useRef(null);
    const refModalComments = useRef(null);
    const refModalPreview = useRef(null);
    const previousFocusRef = useRef(null);
    const [statusMessage1, setStatusMessage1] = useState("");
  
    useEffect(() => {
      if (isEditorOpen && refModalEditarTarea.current) {
        refModalEditarTarea.current.focus();
      }
    }, [isEditorOpen]);
  
    useEffect(() => {
      if (commentsTask != null && refModalComments.current) {
        refModalComments.current.focus();
      }
    }, [commentsTask]);
    
    useEffect(() => {
      if (selectedTask && refModalPreview.current) {
        refModalPreview.current.focus();
      }
    }, [selectedTask]);

    function devolverFoco(previousFocusRef) {
      if (previousFocusRef?.current) {
        previousFocusRef.current.focus(); // 👈 devuelve el foco
      }
    }
  
    // ******************************************************

  useEffect(() => {
    if (Array.isArray(dataList)) {
      setTasks(dataList);
    }
  }, [dataList]);

  const fetchProjectMembers = async (idProyecto) => {
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found.");
        return;
      }

      const response = await fetch(`${baseURL}/tasks/${idProyecto}/members`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener miembros: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("Mi data:", data);

      const formattedMembers = data.map((m) => ({
        id: m.Usuario.idUsuario,
        name: `${m.Usuario.nombre} ${m.Usuario.apellido}`,
      }));

      // Sort with current task members first
      const sorted = formattedMembers.sort((a, b) => {
        const aIsMember = editingTask?.members?.some((m) => m.id === a.id);
        const bIsMember = editingTask?.members?.some((m) => m.id === b.id);
        return aIsMember === bIsMember ? 0 : aIsMember ? -1 : 1;
      });

      setAvailableMembers(sorted);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

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

  const openEditor = async (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;

    setEditingTask({ ...t });
    await fetchProjectMembers(t.project.id);
    previousFocusRef.current = document.activeElement; // 👈 guarda el foco actual
    setIsEditorOpen(true);
  };

  const saveEdits = async () => {
    if (!editingTask) return;

    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        alert("No se encontró el token de autenticación.");
        return;
      }

      const taskUpdates = {
        nombre: editingTask.name,
        fechaEntrega: editingTask.dueDate,
        idPrioridad:
          editingTask.prioridad?.nivel === "Alta"
            ? 3
            : editingTask.prioridad?.nivel === "Media"
            ? 2
            : 1,
        idEstadoTarea:
          editingTask.state === "Hecho"
            ? 3
            : editingTask.state === "En progreso"
            ? 2
            : 1,
      };

      const updateRes = await fetch(`${baseURL}/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(taskUpdates),
      });

      if (!updateRes.ok) {
        throw new Error(
          `Error al actualizar la tarea: ${updateRes.statusText}`
        );
      }

      const currentMemberIds = editingTask.members.map((m) => m.id);

      const originalTask = tasks.find((t) => t.id === editingTask.id);
      const originalMemberIds = originalTask?.members.map((m) => m.id) || [];

      const addedMembers = currentMemberIds.filter(
        (id) => !originalMemberIds.includes(id)
      );
      const removedMembers = originalMemberIds.filter(
        (id) => !currentMemberIds.includes(id)
      );

      for (const idUsuario of addedMembers) {
        await fetch(`${baseURL}/tasks/${editingTask.id}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ idUsuario }),
        });
      }

      for (const idUsuario of removedMembers) {
        await fetch(`${baseURL}/tasks/${editingTask.id}/members/${idUsuario}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id ? { ...t, ...editingTask } : t
        )
      );

      if (fetchTareas) {
        await fetchTareas();
      }

      setIsEditorOpen(false);
      setEditingTask(null);
      devolverFoco(previousFocusRef);

      alert("Tarea actualizada correctamente");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Hubo un problema al guardar los cambios.");
    }
  };

  const cancelEdits = () => {
    setIsEditorOpen(false);
    setEditingTask(null);
    devolverFoco(previousFocusRef);
  };

  const deleteTask = async (taskId) => {
    const confirmDelete = confirm(
      "¿Eliminar tarea? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found");
        return;
      }

      const response = await fetch(`${baseURL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar tarea: ${response.statusText}`);
      }

      console.log(`Tarea ${taskId} eliminada (marcada como inactiva)`);

      if (fetchTareas) {
        await fetchTareas();
      }

      setIsEditorOpen(false);
      setEditingTask(null);
      devolverFoco(previousFocusRef);
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("No se pudo eliminar la tarea. Intenta nuevamente.");
    }
  };

  const handleTaskClick = (task) => {
    previousFocusRef.current = document.activeElement; // 👈 guarda el foco actual
    setSelectedTask(task);
  };

  const openComments = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    previousFocusRef.current = document.activeElement; // 👈 guarda el foco actual
    setCommentsTask({ ...t });
    setNewCommentText("");
  };

  const sendComment = async () => {
    if (!commentsTask || !newCommentText.trim()) {
      toast.error("Debes escribir un comentario");
      return;
    };

    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        alert("No se encontró el token de autenticación.");
        return;
      }

      const body = { comentario: newCommentText.trim() };

      const response = await fetch(
        `${baseURL}/tasks/${commentsTask.id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al enviar comentario: ${response.statusText}`);
      }

      const newComment = await response.json();

      if (fetchTareas) {
        await fetchTareas();
      }

      // Update local tasks state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === commentsTask.id
            ? { ...t, comments: [newComment, ...(t.comments || [])] }
            : t
        )
      );

      toast.info("Se ha enviado el comentario");

      // Close comments modal after publishing
      setCommentsTask(null);
      setNewCommentText("");
    } catch (error) {
      console.error("Error sending comment:", error);
      alert("No se pudo enviar el comentario. Intenta nuevamente.");
    }
  };

  const mostRecentCommentText = (task) => {
    if (!task.comments || task.comments.length === 0) return null;

    // Find the comment with the highest id
    const latestComment = task.comments.reduce((latest, current) =>
      current.id > latest.id ? current : latest
    );

    return latestComment.text;
  };

  const handleAddTaskForDay = async (
    fechaEntrega,
    idNuevaTareaMadre = null
  ) => {
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found");
        return;
      }

      const nuevaTarea = {
        idProyecto: selectedProject,
        idEstadoTarea: 1,
        idPrioridad: 2,
        idTareaMadre: idNuevaTareaMadre,
        nombre: "Nueva tarea",
        fechaEntrega: fechaEntrega || new Date().toISOString().slice(0, 10),
        activado: true,
      };

      const response = await fetch(`${baseURL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(nuevaTarea),
      });

      if (!response.ok) {
        throw new Error(`Error al crear tarea: ${response.statusText}`);
      }

      await response.json();

      if (fetchTareas) {
        await fetchTareas();
      }

      setIsEditorOpen(false);
    } catch (error) {
      console.error("Error adding new task:", error);
      alert("No se pudo crear la tarea. Intenta nuevamente.");
    }
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

      const dateStringForTask = `${currentYear}-${String(
        currentMonth + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const displayDateString = `${months[currentMonth]} ${day}, ${currentYear}`;

      cells.push(
        <div
          key={day}
          className="calendar-cell"
          role="gridcell"
          aria-label={`${displayDateString}, ${tasksForDay.length} tarea(s)`}
          tabIndex={0}
        >
          <div className="day-header">
            <div className="day-number">{day}</div>
            {ViewMode === "Mis Proyectos" &&
              (selectedProjectRole === 1 || selectedProjectRole === 2) && (
                <button
                  className="add-task-day-btn"
                  onClick={(e) => {
                    e.stopPropagation();

                    const dateStringForTask = `${currentYear}-${String(
                      currentMonth + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                    console.log("Adding task for date: ", dateStringForTask);
                    handleAddTaskForDay(dateStringForTask);
                  }}
                  title="Agregar tarea para este día"
                  aria-label={`Agregar tarea para ${months[currentMonth]} ${day}, ${currentYear}`}
                >
                  ➕
                </button>
              )}
          </div>

          {tasksForDay.map((task) => (
            <div
              key={task.id}
              className="task-card"
              role="button"
              tabIndex={0}
              onClick={() => handleTaskClick(task)}
              onKeyDown={(e) => e.key === "Enter" && handleTaskClick(task)}
              aria-label={`Tarea: ${task.name}, Proyecto: ${task.project.name}, Prioridad: ${task.prioridad}`}
            >
              <div className="task-preview">
                {ViewMode !== "Proyectos Anteriores" &&
                  selectedProjectRole !== 4 && (
                    <button
                      className="edit-btn-col"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditor(task.id);
                      }}
                      title="Editar tarea"
                      aria-label={`Editar tarea ${task.name}`}
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
                  {task.name} {getPriorityEmoji(task.prioridad)}
                </div>
                <div className="task-project">{task.project.name}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return cells;
  };

  return (
    <div
      className="calendar-container"
      role="region"
      aria-label={`Calendario del mes de ${months[currentMonth]} ${currentYear}`}
    >
      <div className="calendar-header">
        <FontAwesomeIcon
          icon={faChevronLeft}
          className="arrow-btn"
          onClick={prevMonth}
          role="button"
          tabIndex={0}
          aria-label="Mes anterior"
          onKeyDown={(e) => e.key === "Enter" && prevMonth()}
        />
        <div className="month-selector">
          <select
            id="month-select"
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
            id="year-select"
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
          role="button"
          tabIndex={0}
          aria-label="Mes siguiente"
          onKeyDown={(e) => e.key === "Enter" && nextMonth()}
        />
      </div>

      <div
        className="calendar-grid"
        role="grid"
        aria-label="Días de la semana y tareas"
      >
        {daysOfWeek.map((d) => (
          <div
            key={d}
            className="calendar-day-header"
            role="columnheader"
            aria-label={d}
          >
            {d}
          </div>
        ))}
        {renderDayCells()}
      </div>

      {selectedTask && (
        <div className="task-detail-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-task"
          tabIndex="-1"
          ref={refModalPreview}>
          <button aria-label="Salir de vista previa de tarea" className="close-btn" onClick={() => {setSelectedTask(null); devolverFoco(previousFocusRef)}}>
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
              <strong>Proyecto:</strong> {selectedTask.project.name}
            </p>
          )}

          <p>
            <strong>Prioridad:</strong>{" "}
            {getPriorityEmoji(selectedTask.prioridad)}
          </p>
          <p>
            <strong>Estado:</strong> {selectedTask.state}
          </p>
          <p>
            <strong>Fecha de entrega:</strong> {selectedTask.dueDate}
          </p>
          <p>
            <strong>Integrantes:</strong>{" "}
            {selectedTask.members.map((m) => m.name).join(", ")}
          </p>

          <div className="comments-section">
            <b>Comentarios:</b>
            <br /> <br />
            {Array.isArray(selectedTask.comments) &&
            selectedTask.comments.length > 0 ? (
              <>
                <ul>
                  <li>
                    <b>
                      {
                        selectedTask.comments.find(
                          (c) => c.text === mostRecentCommentText(selectedTask)
                        )?.author
                      }
                      :
                    </b>{" "}
                    {mostRecentCommentText(selectedTask)}
                  </li>
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

      {/* Editor Modal */}
      {isEditorOpen && editingTask && (
        <div
          className="modal-overlay"
          onClick={cancelEdits}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-task-title"
          tabIndex="-1"
          ref={refModalEditarTarea}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="edit-task-title">Editar tarea</h3>
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
                value={editingTask?.prioridad?.nivel || ""}
                onChange={(e) =>
                  setEditingTask((prev) => ({
                    ...prev,
                    prioridad: { ...prev.Prioridad, nivel: e.target.value },
                  }))
                }
              >
                <option value="Alta">🔴 Alta</option>
                <option value="Media">🟡 Media</option>
                <option value="Baja">🟢 Baja</option>
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
                <option value="En progreso">En proceso</option>
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
            {(selectedProjectRole === 1 || selectedProjectRole === 2) && (
              <label>
                Integrantes
                <div className="members-list">
                  {availableMembers.map((member) => {
                    const isMember = editingTask.members?.some(
                      (m) => m.id === member.id
                    );

                    return (
                      <div
                        key={member.id}
                        className={`member-item ${
                          isMember ? "member-selected" : ""
                        }`}
                      >
                        <span>{member.name}</span>
                        <button
                          className="small"
                          onClick={() => {
                            setEditingTask((prev) => ({
                              ...prev,
                              members: isMember
                                ? prev.members.filter((m) => m.id !== member.id)
                                : [...(prev.members || []), member],
                            }));
                          }}
                          aria-label={
                            isMember
                              ? `Quitar ${member.name}`
                              : `Agregar ${member.name}`
                          }
                        >
                          {isMember ? "-" : "+"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </label>
            )}

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
              {(selectedProjectRole === 1 || selectedProjectRole === 2) && (
                <button
                  onClick={() => handleAddTask(editingTask.id)}
                  className="subtask"
                >
                  Agregar subtarea
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {commentsTask && (
        <div
          className="modal-overlay"
          onClick={() => setCommentsTask(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="comments-title"
          tabIndex="-1"
          ref={refModalComments}
        >
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="comments-title">Comentarios</h3>
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
              <button onClick={() => {setCommentsTask(null); devolverFoco(previousFocusRef)}}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};