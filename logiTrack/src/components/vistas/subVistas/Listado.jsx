import React, { useState, useEffect } from "react";
import "./Listado.css";

const currentUser = "Giovanni";

export const Listado = ({ dataList, ViewMode, selectedProject }) => {
  const [tasks, setTasks] = useState(() =>
    Array.isArray(dataList) ? dataList.slice() : []
  );
  const [editingTask, setEditingTask] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [commentsTask, setCommentsTask] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [expandedTasks, setExpandedTasks] = useState({});

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

  const handleAddSubtask = (parentId) => {
    const parent = tasks.find((x) => x.id === parentId);
    const newTask = {
      id: makeId(),
      name: "Nueva subtarea",
      project: parent ? parent.project : "-",
      priority: 2,
      state: "Sin iniciar",
      dueDate: new Date().toISOString().slice(0, 10),
      members: parent ? [...parent.members] : [],
      comments: [],
      subtaskOf: parentId,
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

  const buildHierarchy = (list) => {
    const map = {};
    const roots = [];
    list.forEach((task) => {
      map[task.id] = { ...task, subtasks: [] };
    });
    list.forEach((task) => {
      if (task.subtaskOf) {
        if (map[task.subtaskOf])
          map[task.subtaskOf].subtasks.push(map[task.id]);
        else roots.push(map[task.id]);
      } else roots.push(map[task.id]);
    });
    return roots;
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

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const roots = buildHierarchy(tasks);

  const renderTaskRow = (t, level = 0) => {
    const hasSubtasks = t.subtasks && t.subtasks.length > 0;
    const isExpanded = !!expandedTasks[t.id];
    return (
      <React.Fragment key={t.id}>
        <tr className={`task-row level-${level}`} role="row">
          <td style={{ position: "relative" }} role="cell">
            <div className="task-name">
              {hasSubtasks && (
                <button
                  className="dropdown-toggle"
                  onClick={() => toggleExpand(t.id)}
                  aria-label={
                    isExpanded ? "Colapsar subtareas" : "Expandir subtareas"
                  }
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              )}
              <span className="task-text">{t.name}</span>
            </div>

            {ViewMode !== "Proyectos Anteriores" && (
              <button
                className="edit-btn"
                onClick={() => openEditor(t.id)}
                title="Editar tarea"
              >
                Editar
              </button>
            )}
          </td>
          {ViewMode === "Mis Tareas" && <td role="cell">{t.project || "-"}</td>}
          <td role="cell">{getPriorityEmoji(t.priority)}</td>
          <td role="cell">{t.state}</td>
          <td role="cell">{t.dueDate}</td>
          <td role="cell">
            {Array.isArray(t.members) ? t.members.join(", ") : ""}
          </td>
          <td role="cell">
            {mostRecentCommentText(t) ? (
              <button
                className="comment-preview"
                onClick={() => openComments(t.id)}
                title="Ver todos los comentarios"
              >
                {mostRecentCommentText(t)}
              </button>
            ) : (
              <div className="no-comments-cell">
                <span className="no-comment-text">Sin comentarios</span>
                {ViewMode !== "Proyectos Anteriores" && (
                  <button
                    className="add-comment-btn"
                    onClick={() => openComments(t.id)}
                    title="Agregar comentario"
                  >
                    💬
                  </button>
                )}
              </div>
            )}
          </td>
        </tr>

        {hasSubtasks &&
          isExpanded &&
          t.subtasks.map((s) => renderTaskRow(s, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="listado-container">
      <table
        className="listado-table"
        role="table"
        aria-label="Listado de tareas"
      >
        <thead>
          <tr role="row">
            <th scope="col">Nombre</th>
            {ViewMode === "Mis Tareas" && <th scope="col">Proyecto</th>}
            <th scope="col">Prioridad</th>
            <th scope="col">Estado</th>
            <th scope="col">Fecha Entrega</th>
            <th scope="col">Integrantes</th>
            <th scope="col">Comentarios</th>
          </tr>
        </thead>
        <tbody>{roots.map((task) => renderTaskRow(task))}</tbody>
      </table>

      {ViewMode !== "Mis Tareas" && ViewMode !== "Proyectos Anteriores" && (
        <div className="add-row">
          <button
            className="add-btn"
            onClick={handleAddTask}
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
