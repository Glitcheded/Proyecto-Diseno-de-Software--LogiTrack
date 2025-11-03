import React, { useState } from "react";
import "./VistaProyectos.css";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../../supabaseClient";

const baseURL = "http://localhost:3001/api/projects"; // ensure correct endpoint

export const VistaProyectos = ({ ViewMode, dataList, setDataList }) => {
  const { userName, userEmail, userLastName, userId } = useUser();

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
        proj.idProyecto === editedProject.idProyecto ? editedProject : proj
      )
    );
    closeEditor();
  };

  const handleDelete = () => {
    if (!confirm("¿Eliminar proyecto? Esta acción no se puede deshacer."))
      return;
    setDataList((prev) =>
      prev.filter((proj) => proj.idProyecto !== editedProject.idProyecto)
    );
    closeEditor();
  };

  const handleAddProject = async () => {
    try {
      // Get token directly from localStorage
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.error("No token found, please log in again");
        return;
      }

      const newProjectPayload = {
        nombre: "Nuevo proyecto sin título",
        descripcion: "",
        ultimaModificacion: new Date().toISOString(),
        fechaFinalizacion: null,
        idEstadoProyecto: 1, // "En proceso"
        activado: true,
      };

      const res = await fetch(`${baseURL}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newProjectPayload),
      });

      if (!res.ok) throw new Error("Failed to create project");
      const createdProject = await res.json();

      const projectForTable = {
        idProyecto: createdProject.idProyecto,
        nombre: createdProject.nombre,
        descripcion: createdProject.descripcion,
        ultimaModificacion: createdProject.ultimaModificacion,
        fechaFinalizacion: createdProject.fechaFinalizacion,
        estado: "En proceso",
        memberList: [
          {
            id: userId,
            name: `${userName} ${userLastName}`,
            email: userEmail,
            role: "Administrador",
          },
        ],
      };

      setDataList((prev) => [...prev, projectForTable]);
      console.log("Proyecto creado:", projectForTable);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  const filteredProjects = Array.isArray(dataList)
    ? dataList.filter((project) =>
        isPrevious
          ? project.estado !== "En proceso"
          : project.estado === "En proceso"
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
            {isPrevious ? <th>Estado</th> : null}
          </tr>
        </thead>

        <tbody>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <tr key={project.idProyecto} className="proyecto-row">
                <td className="proyecto-name-cell">
                  {project.nombre}
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
                    onClick={() => openDescription(project.descripcion)}
                    title="Ver descripción completa"
                  >
                    Ver descripción
                  </button>
                </td>
                <td>{project.ultimaModificacion}</td>
                <td>
                  {isPrevious
                    ? project.fechaFinalizacion || "-"
                    : project.fechaEntregaProxima || "-"}
                </td>
                <td>{project.memberList?.length || 0}</td>
                {isPrevious ? <td>{project.estado}</td> : null}
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
                value={editedProject.nombre}
                onChange={(e) => handleFieldChange("nombre", e.target.value)}
              />
            </label>

            <label>
              Descripción
              <input
                type="text"
                value={editedProject.descripcion}
                onChange={(e) =>
                  handleFieldChange("descripcion", e.target.value)
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
