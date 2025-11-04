import React, { useState, useEffect } from "react";
import "./Columnas.css";

export const Columnas = ({ dataList, ViewMode, selectedProject }) => {
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

  const toggleExpand = (id) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTaskToState = (state) => {
    const newTask = {
      id: makeId(),
      name: "Nueva tarea",
      project: "-",
      priority: 2,
      state,
      dueDate: new Date().toISOString().slice(0, 10),
      members: [],
      comments: [],
      subtaskOf: null,
    };
    setTasks((prev) => [...prev, newTask]);
    setEditingTask({ ...newTask });
    setIsEditorOpen(true);
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

  const groupedTasks = {
    "Sin Iniciar": tasks.filter(
      (t) => t.state?.toLowerCase() === "sin iniciar"
    ),
    "En Proceso": tasks.filter((t) => t.state?.toLowerCase() === "en proceso"),
    Hecho: tasks.filter((t) => t.state?.toLowerCase() === "hecho"),
  };

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

  const renderTask = (task) => {
    const isExpanded = expandedTasks[task.id];
    const isSubtask = Boolean(task.subtaskOf);
    const parentName = getParentName(task);

    return (
      <div
        key={task.id}
        className={`task-card ${isSubtask ? "subtask-row" : ""}`}
        onClick={() => toggleExpand(task.id)}
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
          <span className="priority">{getPriorityEmoji(task.priority)}</span>
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
              {Array.isArray(task.comments) && task.comments.length > 0 ? (
                <>
                  <ul>
                    {task.comments.slice(0, 1).map((c, i) => (
                      <li key={i}>
                        <b>{c.author}:</b> {c.text}
                      </li>
                    ))}
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
                    <div
                      key={member}
                      className={`member-item ${
                        isMember ? "member-selected" : ""
                      }`}
                    >
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
                        aria-label={
                          isMember ? `Quitar ${member}` : `Agregar ${member}`
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
                onClick={() => handleAddSubtask(editingTask.id)}
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
