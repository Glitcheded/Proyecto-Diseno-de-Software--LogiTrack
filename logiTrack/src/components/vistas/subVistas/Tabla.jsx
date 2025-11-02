import React, { useState, useEffect } from "react";
import "./Tabla.css";

const currentUser = "Giovanni";

export const Tabla = ({ dataList, ViewMode, selectedProject }) => {
  const [tasks, setTasks] = useState(() =>
    Array.isArray(dataList) ? dataList.slice() : []
  );
  const [editingTask, setEditingTask] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [commentsTask, setCommentsTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");

  const getParentName = (task) => {
    const parent = tasks.find((t) => t.id === task.subtaskOf);
    return parent ? parent.name : "Desconocido";
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

  const makeId = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const handleAddTask = () => {
    const newTask = {
      id: makeId(),
      name: "Nueva tarea",
      project: "-",
      priority: 2,
      state: "Sin iniciar",
      dueDate: new Date().toISOString().slice(0, 10),
      members: [],
      comments: [],
      subtaskOf: null,
    };
    setTasks((t) => [...t, newTask]);
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
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsEditorOpen(false);
    setEditingTask(null);
  };

  const openComments = (taskId) => {
    const t = tasks.find((x) => x.id === taskId);
    if (!t) return;
    setCommentsTask({ ...t });
    setNewCommentText("");
  };

  const sendComment = () => {
    if (!commentsTask || !newCommentText.trim()) return;
    const comment = { author: currentUser, text: newCommentText.trim() };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === commentsTask.id
          ? { ...t, comments: [comment, ...(t.comments || [])] }
          : t
      )
    );

    setCommentsTask((c) => ({
      ...c,
      comments: [comment, ...(c.comments || [])],
    }));

    setNewCommentText("");
  };

  const mostRecentCommentText = (task) =>
    task.comments && task.comments.length ? task.comments[0].text : null;

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

  return (
    <div className="tabla-container">
      <table className="tabla-table">
        <thead>
          <tr>
            <th>Nombre</th>
            {ViewMode === "Mis Tareas" && <th>Proyecto</th>}
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha Entrega</th>
            <th>Integrantes</th>
            <th>Comentarios</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="task-row">
              <td style={{ position: "relative" }}>
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
                    title="Editar tarea"
                  >
                    Editar
                  </button>
                )}
              </td>

              {ViewMode === "Mis Tareas" && <td>{task.project || "-"}</td>}
              <td>{getPriorityEmoji(task.priority)}</td>
              <td>{task.state}</td>
              <td>{task.dueDate}</td>
              <td>
                {Array.isArray(task.members) ? task.members.join(", ") : ""}
              </td>
              <td>
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

      {ViewMode === "Mis Proyectos" && (
        <div className="add-row">
          <button className="add-btn" onClick={handleAddTask}>
            ➕ Agregar tarea
          </button>
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
                        onClick={() =>
                          setEditingTask((prev) => ({
                            ...prev,
                            members: isMember
                              ? prev.members.filter((m) => m !== member)
                              : [...(prev.members || []), member],
                          }))
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
