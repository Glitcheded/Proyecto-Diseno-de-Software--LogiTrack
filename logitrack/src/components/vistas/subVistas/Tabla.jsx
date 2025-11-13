import React, { useState, useEffect, useRef } from "react";
import "./Tabla.css";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api`;

export const Tabla = ({
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
  const [sortConfig, setSortConfig] = React.useState({
    key: null,
    direction: null,
  });

  // ******************************************************
    const refModalEditarTarea = useRef(null);
    const refModalComments = useRef(null);
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
  
    function devolverFoco(previousFocusRef) {
      if (previousFocusRef?.current) {
        previousFocusRef.current.focus(); // 👈 devuelve el foco
      }
    }
  
    // ******************************************************

  const getParentName = (task) => {
    const parent = tasks.find((t) => t.id === task.subtaskOf);
    return parent ? parent.name : "Desconocido";
  };

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

  const handleAddTask = async (idNuevaTareaMadre = null) => {
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
      return;}

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

      toast.info("Se ha enviado el comentario");

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
      devolverFoco(previousFocusRef);
    } catch (error) {
      console.error("Error sending comment:", error);
      alert("No se pudo enviar el comentario. Intenta nuevamente.");
    }
  };

  const mostRecentCommentText = (task) => {
    if (!task.comments || task.comments.length === 0) return null;

    const latestComment = task.comments.reduce((latest, current) =>
      current.id > latest.id ? current : latest
    );

    const text = latestComment.text || "";
    const maxLength = 30;

    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
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

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null }; // reset
      }
      return { key, direction: "asc" };
    });
  };

  const sortTasks = (tasks) => {
    if (!sortConfig.key || !sortConfig.direction) return tasks;

    const sorted = [...tasks].sort((a, b) => {
      let aVal, bVal;

      switch (sortConfig.key) {
        case "nombre":
          aVal = a.name?.toLowerCase() || "";
          bVal = b.name?.toLowerCase() || "";
          break;
        case "prioridad":
          const order = { Alta: 3, Media: 2, Baja: 1 };
          aVal = order[a.prioridad?.nivel] || 0;
          bVal = order[b.prioridad?.nivel] || 0;
          break;
        case "estado":
          aVal = a.state?.toLowerCase() || "";
          bVal = b.state?.toLowerCase() || "";
          break;
        case "fechaEntrega":
          aVal = new Date(a.dueDate);
          bVal = new Date(b.dueDate);
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Then, before rendering rows
  const sortedTasks = sortTasks(tasks);

  return (
    <div
      className="tabla-container"
      role="region"
      aria-label={
        ViewMode === "Mis Tareas" ? "Tabla de mis tareas" : "Tabla de proyectos"
      }
    >
      <table className="tabla-table" role="table">
        <thead>
          <tr role="row">
            <th
              role="columnheader"
              onClick={() => handleSort("nombre")}
              style={{ cursor: "pointer" }}
            >
              Nombre{" "}
              {sortConfig.key === "nombre"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>

            {ViewMode === "Mis Tareas" && <th role="columnheader">Proyecto</th>}

            <th
              role="columnheader"
              onClick={() => handleSort("prioridad")}
              style={{ cursor: "pointer" }}
            >
              Prioridad{" "}
              {sortConfig.key === "prioridad"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>

            <th
              role="columnheader"
              onClick={() => handleSort("estado")}
              style={{ cursor: "pointer" }}
            >
              Estado{" "}
              {sortConfig.key === "estado"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>

            <th
              role="columnheader"
              onClick={() => handleSort("fechaEntrega")}
              style={{ cursor: "pointer" }}
            >
              Fecha Entrega{" "}
              {sortConfig.key === "fechaEntrega"
                ? sortConfig.direction === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </th>

            <th role="columnheader">Integrantes</th>
            <th role="columnheader">Comentarios</th>
          </tr>
        </thead>

        <tbody>
          {sortedTasks.map((task) => (
            <tr key={task.id} role="row" className="task-row">
              <td role="cell" style={{ position: "relative" }}>
                {Boolean(task.subtaskOf) && (
                  <div className="subtask-label">
                    Subtarea: <b>{getParentName(task)}</b>
                  </div>
                )}
                <div className="task-name">{task.name}</div>

                {ViewMode !== "Proyectos Anteriores" && (
                  <button
                    className="edit-btn"
                    onClick={() => openEditor(task.id)}
                    title={`Editar tarea ${task.name}`}
                    aria-label={`Editar tarea ${task.name}`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openEditor(task.id)}
                  >
                    Editar
                  </button>
                )}
              </td>

              {ViewMode === "Mis Tareas" && (
                <td role="cell">{task.project.name || "-"}</td>
              )}

              <td
                role="cell"
                aria-label={`Prioridad ${getPriorityEmoji(task.prioridad)}`}
              >
                {getPriorityEmoji(task.prioridad)}
              </td>

              <td role="cell">{task.state}</td>
              <td role="cell">{task.dueDate}</td>

              <td role="cell">
                {Array.isArray(task.members)
                  ? task.members.map((m, i) => {
                      const parts = m.name.trim().split(" ");
                      const first = parts[0];
                      const last =
                        parts.length > 1 ? parts[parts.length - 1] : "";
                      const displayName = last
                        ? `${first} ${last.charAt(0)}.`
                        : first;
                      return <div key={i}>{displayName}</div>;
                    })
                  : ""}
              </td>

              <td role="cell">
                {mostRecentCommentText(task) ? (
                  <button
                    className="comment-preview"
                    onClick={() => openComments(task.id)}
                    title="Ver todos los comentarios"
                  >
                    {mostRecentCommentText(task)}
                  </button>
                ) : (
                  <div className="no-comments-cell">
                    <span className="no-comment-text">Sin comentarios</span>
                    {ViewMode !== "Proyectos Anteriores" && (
                      <button
                        className="add-comment-btn"
                        onClick={() => openComments(task.id)}
                        title="Agregar comentario"
                      >
                        💬
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {ViewMode !== "Mis Tareas" &&
        ViewMode !== "Proyectos Anteriores" &&
        (selectedProjectRole === 1 || selectedProjectRole === 2) && (
          <div className="add-row">
            <button
              className="add-btn"
              onClick={() => handleAddTask()}
              title="Agregar tarea"
            >
              ➕ Agregar tarea
            </button>
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
              <button onClick={() => {setCommentsTask(null); devolverFoco(previousFocusRef);}}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};