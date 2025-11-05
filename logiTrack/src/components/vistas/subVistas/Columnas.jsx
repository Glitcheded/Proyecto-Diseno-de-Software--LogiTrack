import React, { useState, useEffect } from "react";
import "./Columnas.css";

const baseURL = "http://localhost:3001/api";

export const Columnas = ({
  dataList,
  ViewMode,
  selectedProject,
  fetchTareas,
}) => {
  const [tasks, setTasks] = useState(() =>
    Array.isArray(dataList) ? dataList.slice() : []
  );
  const [expandedTasks, setExpandedTasks] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [commentsTask, setCommentsTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

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

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTaskToState = async (state, idNuevaTareaMadre = null) => {
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.warn("No access token found");
        return;
      }

      // Map human-readable state to idEstadoTarea
      const stateMap = {
        "Sin Iniciar": 1,
        "En Progreso": 2,
        Hecho: 3,
      };

      const nuevaTarea = {
        idProyecto: selectedProject,
        idEstadoTarea: stateMap[state] || 1, // default to 1 if state not recognized
        idPrioridad: 2,
        idTareaMadre: idNuevaTareaMadre,
        nombre: "Nueva tarea",
        fechaEntrega: new Date().toISOString().slice(0, 10),
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

  const openEditor = async (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;

    setEditingTask({ ...t });
    await fetchProjectMembers(t.project.id);
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

      alert("Tarea actualizada correctamente");
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Hubo un problema al guardar los cambios.");
    }
  };

  const cancelEdits = () => {
    setIsEditorOpen(false);
    setEditingTask(null);
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
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert("No se pudo eliminar la tarea. Intenta nuevamente.");
    }
  };

  const openComments = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setCommentsTask({ ...t });
    setNewCommentText("");
  };

  const sendComment = async () => {
    if (!commentsTask || !newCommentText.trim()) return;

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

  const groupedTasks = {
    "Sin Iniciar": tasks.filter(
      (t) => t.state?.toLowerCase() === "sin iniciar"
    ),
    "En Progreso": tasks.filter(
      (t) => t.state?.toLowerCase() === "en progreso"
    ),
    Hecho: tasks.filter((t) => t.state?.toLowerCase() === "hecho"),
  };

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

  const renderTask = (task) => {
    const isExpanded = expandedTasks[task.id];
    const isSubtask = Boolean(task.subtaskOf);
    const parentName = getParentName(task);

    return (
      <div
        key={task.id}
        className={`task-card ${isSubtask ? "subtask-row" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => toggleExpand(task.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpand(task.id);
          }
        }}
      >
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

        <div className="task-preview">
          {isSubtask && (
            <div className="subtask-label">
              Subtarea: <b>{parentName}</b>
            </div>
          )}
          <span className="priority">{getPriorityEmoji(task.prioridad)}</span>
          <span className="task-name">{task.name}</span>
          <span className="task-project">{task.project.name}</span>
          <span className="task-date">{task.dueDate}</span>
        </div>

        {isExpanded && (
          <div className="task-details" onClick={(e) => e.stopPropagation()}>
            <div>
              <b>Estado:</b> {task.state}
            </div>
            <div>
              <b>Prioridad:</b> {getPriorityEmoji(task.prioridad)}
            </div>
            <div>
              <b>Integrantes:</b>{" "}
              {Array.isArray(task.members)
                ? task.members.map((m) => m.name).join(", ")
                : ""}
            </div>
            <div>
              <b>Comentarios:</b>
              <br />
              <br />
              {Array.isArray(task.comments) && task.comments.length > 0 ? (
                <>
                  <ul>
                    <li>
                      <b>
                        {
                          task.comments.find(
                            (c) => c.text === mostRecentCommentText(task)
                          )?.author
                        }
                        :
                      </b>{" "}
                      {mostRecentCommentText(task)}
                    </li>
                  </ul>
                  <button
                    className="comment-preview"
                    onClick={(e) => {
                      e.stopPropagation();
                      openComments(task.id);
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
                        openComments(task.id);
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
      </div>
    );
  };

  return (
    <div className="columnas-container">
      {Object.entries(groupedTasks).map(([state, tasksByState]) => (
        <div className="column" key={state}>
          <div className="column-header">
            <h2>{state}</h2>
            {ViewMode !== "Mis Tareas" &&
              ViewMode !== "Proyectos Anteriores" && (
                <button
                  className="add-task-btn"
                  title={`Agregar tarea a ${state}`}
                  onClick={() => handleAddTaskToState(state)}
                >
                  ➕
                </button>
              )}
          </div>
          <div className="column-tasks">
            {tasksByState.map((task) => renderTask(task))}
          </div>
        </div>
      ))}

      {/* Editor Modal */}
      {isEditorOpen && editingTask && (
        <div
          className="modal-overlay"
          onClick={cancelEdits}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-task-title"
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
                onClick={() =>
                  handleAddTaskToState(editingTask.state, editingTask.id)
                }
                className="subtask"
              >
                Agregar subtarea
              </button>
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
              <button onClick={() => setCommentsTask(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
