import React, { useState } from "react";
import "./VistaProyectos.css";

export const VistaProyectos = ({ ViewMode, dataList, setDataList }) => {
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Colaborador");

  const [showCloseOptions, setShowCloseOptions] = useState(false);

  const isPrevious = ViewMode === "Proyectos Anteriores";

  const openDescription = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDescription(null);
  };

  const openEditor = (project) => {
    setEditedProject({
      ...project,
      memberList: project.memberList ? [...project.memberList] : [],
    });
    setEditModalOpen(true);
  };

  const closeEditor = () => {
    setEditModalOpen(false);
    setEditedProject(null);
    setNewMemberEmail("");
  };

  const handleFieldChange = (field, value) => {
    setEditedProject({ ...editedProject, [field]: value });
  };

  const handleRemoveMember = (id) => {
    setEditedProject({
      ...editedProject,
      memberList: editedProject.memberList.filter((m) => m.id !== id),
    });
  };

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    const newMember = {
      id: Date.now(),
      name: "Usuario Placeholder",
      email: newMemberEmail,
      role: newMemberRole,
    };
    setEditedProject({
      ...editedProject,
      memberList: [...editedProject.memberList, newMember],
    });
    setNewMemberEmail("");
  };

  const handleConfirm = () => {
    setDataList((prev) =>
      prev.map((proj) =>
        proj.id === editedProject.id
          ? {
              ...editedProject,
              members:
                editedProject.memberList?.length || editedProject.members,
            }
          : proj
      )
    );
    closeEditor();
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar proyecto? Esta acción no se puede deshacer."))
      return;
    setDataList((prev) => prev.filter((proj) => proj.id !== editedProject.id));
    closeEditor();
  };

  const handleAddProject = () => {
    const newProject = {
      id: Date.now(),
      name: "Nuevo proyecto sin título",
      description: "Descripción pendiente...",
      lastModification: new Date().toISOString().split("T")[0],
      nextDeliveryDate: "-",
      state: "En proceso",
      memberList: [
        {
          id: 1,
          name: "Giovanni",
          email: "giovanni@soltura.com",
          role: "Administrador",
        },
      ],
    };

    setDataList((prev) => [...prev, newProject]);
  };

  const filteredProjects = Array.isArray(dataList)
    ? dataList.filter((project) =>
        isPrevious
          ? project.state !== "En proceso"
          : project.state === "En proceso"
      )
    : [];

  return (
    <div className="proyectos-container">
      <table className="proyectos-table">
        <thead>
          <tr>
            <th>Nombre del proyecto</th>
            <th>Descripción</th>
            <th>Última modificación</th>
            <th>{isPrevious ? "Fecha de finalización" : "Próxima entrega"}</th>
            <th># de miembros</th>
            {isPrevious && <th>Estado</th>} {/* New column */}
          </tr>
        </thead>

        <tbody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <tr key={project.id} className="proyecto-row">
                <td className="proyecto-name-cell">
                  {project.name}
                  <button
                    className="proyecto-edit-btn"
                    onClick={() => openEditor(project)}
                    title="Editar proyecto"
                  >
                    Editar
                  </button>
                </td>
                <td>
                  <button
                    className="proyecto-desc-btn"
                    onClick={() => openDescription(project.description)}
                    title="Ver descripción completa"
                  >
                    Ver descripción
                  </button>
                </td>
                <td>{project.lastModification}</td>
                <td>
                  {isPrevious
                    ? project.finishDate || "-"
                    : project.nextDeliveryDate || "-"}
                </td>
                <td>{project.memberList?.length || project.members || 0}</td>
                {isPrevious && <td>{project.state}</td>} {/* New cell */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isPrevious ? "6" : "5"} className="proyectos-empty">
                No hay proyectos para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!isPrevious && (
        <div className="add-row">
          <button
            className="add-btn"
            onClick={handleAddProject}
            title="Nuevo proyecto"
          >
            ➕ Nuevo proyecto
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Descripción del proyecto</h3>
            <p>{selectedDescription}</p>
            <button className="proyecto-close-btn" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {editModalOpen && editedProject && (
        <div className="modal-overlay" onClick={closeEditor}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Editar proyecto</h3>

            <label>
              Nombre del proyecto
              <input
                type="text"
                value={editedProject.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
              />
            </label>

            <label>
              Descripción
              <input
                type="text"
                value={editedProject.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
              />
            </label>

            <h4>Miembros del proyecto</h4>
            <table className="members-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {editedProject.memberList?.map((member) => (
                  <tr key={member.id} className="member-row">
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td>
                      <button
                        className="small danger"
                        onClick={() => handleRemoveMember(member.id)}
                        title="Eliminar miembro"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="add-member-row">
                  <td colSpan="4">
                    <div className="add-member">
                      <input
                        type="text"
                        placeholder="Correo del nuevo miembro"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                      <select
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                      >
                        <option>Administrador</option>
                        <option>Gestor de proyectos</option>
                        <option>Colaborador</option>
                        <option>Observador</option>
                      </select>
                      <button onClick={handleAddMember}>+</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="modal-actions">
              <button className="confirm" onClick={handleConfirm}>
                Guardar cambios
              </button>
              <button className="cancel" onClick={closeEditor}>
                Cancelar
              </button>
              <button className="danger" onClick={handleDelete}>
                Eliminar proyecto
              </button>

              {ViewMode === "Mis Proyectos" && (
                <>
                  <button
                    className="secondary"
                    onClick={() => {
                      if (
                        confirm(
                          "¿Estás seguro de que quieres cancelar este proyecto? Esta acción no se puede deshacer."
                        )
                      ) {
                        const today = new Date().toISOString().split("T")[0];
                        setDataList((prev) =>
                          prev.map((p) =>
                            p.id === editedProject.id
                              ? { ...p, state: "Cancelado", finishDate: today }
                              : p
                          )
                        );
                        closeEditor();
                      }
                    }}
                  >
                    Cancelar proyecto
                  </button>

                  <button
                    className="secondary"
                    onClick={() => {
                      if (
                        confirm(
                          "¿Estás seguro de que quieres finalizar este proyecto? Esta acción no se puede deshacer."
                        )
                      ) {
                        const today = new Date().toISOString().split("T")[0];
                        setDataList((prev) =>
                          prev.map((p) =>
                            p.id === editedProject.id
                              ? { ...p, state: "Finalizado", finishDate: today }
                              : p
                          )
                        );
                        closeEditor();
                      }
                    }}
                  >
                    Finalizar proyecto
                  </button>
                </>
              )}

              {ViewMode === "Proyectos Anteriores" && (
                <button
                  className="secondary"
                  onClick={() => {
                    if (
                      confirm(
                        "¿Restaurar este proyecto y volverlo a marcar como 'En proceso'?"
                      )
                    ) {
                      setDataList((prev) =>
                        prev.map((p) =>
                          p.id === editedProject.id
                            ? { ...p, state: "En proceso" }
                            : p
                        )
                      );
                      closeEditor();
                    }
                  }}
                >
                  Restaurar proyecto
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
