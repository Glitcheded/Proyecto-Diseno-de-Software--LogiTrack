import React, { useState, useEffect } from "react";
import "./VistaProyectos.css";
import { useUser } from "../../../context/UserContext";
import { supabase } from "../../../../supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const baseURL = `${API_BASE_URL}/api/projects`;

export const VistaProyectos = ({
  ViewMode,
  dataList,
  setDataList,
  fetchProjects,
}) => {
  const { userName, userEmail, userLastName, userId } = useUser();

  const [selectedDescription, setSelectedDescription] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Colaborador");
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const [addMemberError, setAddMemberError] = useState("");

  const [projectMembers, setProjectMembers] = useState({});

  const isPrevious = ViewMode === "Proyectos Anteriores";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.split("T")[0];
  };

  const mapEstado = (idEstado) => {
    switch (idEstado) {
      case 1:
        return "En proceso";
      case 2:
        return "Cancelado";
      case 3:
        return "Finalizado";
      default:
        return "Desconocido";
    }
  };

  const fetchMembers = async (idProyecto) => {
    try {
      const { data, error } = await supabase
        .from("UsuarioPorProyecto")
        .select(
          `
          Rol ( nombre ),
          Usuario ( idUsuario, nombre, apellido, email )
        `
        )
        .eq("idProyecto", idProyecto);

      if (error) throw error;

      const members = data.map((item) => ({
        id: item.Usuario.idUsuario,
        name: `${item.Usuario.nombre} ${item.Usuario.apellido}`,
        email: item.Usuario.email,
        role: item.Rol.nombre,
      }));

      setProjectMembers((prev) => ({ ...prev, [idProyecto]: members }));
    } catch (err) {
      console.error(`Error fetching members for project ${idProyecto}:`, err);
      setProjectMembers((prev) => ({ ...prev, [idProyecto]: [] }));
    }
  };

  useEffect(() => {
    dataList.forEach((project) => fetchMembers(project.idProyecto));
  }, [dataList]);

  const openDescription = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const openMembersModal = (project) => {
    const members = projectMembers[project.idProyecto] || [];
    setSelectedProjectMembers(members);
    setSelectedProjectName(project.nombre);
    setIsMembersModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDescription(null);
  };

  const closeMembersModal = () => {
    setIsMembersModalOpen(false);
    setSelectedProjectMembers([]);
    setSelectedProjectName("");
  };

  const openEditor = (project) => {
    const members = projectMembers[project.idProyecto] || [];
    setEditedProject({ ...project, memberList: [...members] });
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

  const handleAddMember = async () => {
    const email = newMemberEmail.trim();
    if (!email) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/config/email/${email}`);
      if (!res.ok) {
        if (res.status === 404) {
          setAddMemberError("Usuario no encontrado con ese correo");
          return;
        } else {
          throw new Error("Error al buscar usuario");
        }
      }

      const user = await res.json();

      if (editedProject.memberList.some((m) => m.id === user.idUsuario)) {
        setAddMemberError("Usuario ya está en el proyecto");
        return;
      }

      const newMember = {
        id: user.idUsuario,
        name: `${user.nombre} ${user.apellido}`,
        email: user.email,
        role: newMemberRole,
      };

      setEditedProject({
        ...editedProject,
        memberList: [...editedProject.memberList, newMember],
      });

      setNewMemberEmail("");
      setAddMemberError("");
    } catch (err) {
      console.error("Error al agregar miembro:", err);
      setAddMemberError("Error al agregar miembro");
    }
  };

  const handleConfirm = async () => {
    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.error("No token found, please log in again");
        return;
      }

      const projectId = editedProject.idProyecto;

      await fetch(`${baseURL}/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          nombre: editedProject.nombre,
          descripcion: editedProject.descripcion,
          idEstadoProyecto: editedProject.idEstadoProyecto,
        }),
      });

      const originalMembers = projectMembers[projectId] || [];
      const removedMembers = originalMembers.filter(
        (m) => !editedProject.memberList.some((em) => em.id === m.id)
      );

      for (const member of removedMembers) {
        await fetch(`${baseURL}/${projectId}/members/${member.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      const addedMembers = editedProject.memberList.filter(
        (m) => !originalMembers.some((om) => om.id === m.id)
      );

      for (const member of addedMembers) {
        await fetch(`${baseURL}/${projectId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            idUsuario: member.id,
            idRol: member.role,
          }),
        });
      }

      setDataList((prev) =>
        prev.map((proj) =>
          proj.idProyecto === projectId ? editedProject : proj
        )
      );
      setProjectMembers((prev) => ({
        ...prev,
        [projectId]: editedProject.memberList,
      }));

      if (fetchProjects) {
        await fetchProjects();
      }

      closeEditor();
      console.log("Proyecto y miembros actualizados correctamente");
    } catch (err) {
      console.error("Error al guardar cambios del proyecto:", err);
      alert("Ocurrió un error al guardar los cambios. Revisa la consola.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar proyecto? Esta acción no se puede deshacer."))
      return;

    try {
      const accessToken = localStorage.getItem("supabaseToken");
      if (!accessToken) {
        console.error("No token found, please log in again");
        alert("No se encontró token, por favor inicia sesión nuevamente.");
        return;
      }

      const projectId = editedProject.idProyecto;

      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar proyecto");
      }

      console.log(`Proyecto ${projectId} eliminado correctamente`);

      setDataList((prev) =>
        prev.filter((proj) => proj.idProyecto !== projectId)
      );

      setProjectMembers((prev) => {
        const updated = { ...prev };
        delete updated[projectId];
        return updated;
      });

      closeEditor();
      alert("Proyecto eliminado exitosamente.");
    } catch (err) {
      console.error("Error al eliminar proyecto:", err);
      alert("Ocurrió un error al eliminar el proyecto. Revisa la consola.");
    }
  };

  const handleAddProject = async () => {
    try {
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
        idEstadoProyecto: 1,
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
        idEstadoProyecto: createdProject.idEstadoProyecto,
        nombre: createdProject.nombre,
        descripcion: createdProject.descripcion || "",
        ultimaModificacion:
          formatDate(createdProject.ultimaModificacion) ||
          formatDate(new Date().toISOString()),
        fechaFinalizacion: formatDate(createdProject.fechaFinalizacion),
        activado: createdProject.activado ?? true,
        fechaEntregaProxima: null,
      };

      setDataList((prev) => [...prev, projectForTable]);
      setProjectMembers((prev) => ({
        ...prev,
        [createdProject.idProyecto]: [
          {
            id: userId,
            name: `${userName} ${userLastName}`,
            email: userEmail,
            role: "Administrador",
          },
        ],
      }));

      if (fetchProjects) {
        await fetchProjects();
      }

      console.log("Proyecto creado:", projectForTable);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div
      className="proyectos-container"
      role="region"
      aria-label="Vista de proyectos"
    >
      <table
        className="proyectos-table"
        role="table"
        aria-label="Lista de proyectos"
      >
        <thead>
          <tr role="row">
            <th role="columnheader">Nombre del proyecto</th>
            <th role="columnheader">Descripción</th>
            <th role="columnheader"># de miembros</th>
            {isPrevious && <th role="columnheader">Estado</th>}
          </tr>
        </thead>

        <tbody>
          {dataList.length > 0 ? (
            dataList.map((project) => (
              <tr key={project.idProyecto} className="proyecto-row" role="row">
                <td role="cell" className="proyecto-name-cell">
                  <strong>{project.nombre}</strong>
                  {project.idRol === 1 && (
                    <button
                      className="proyecto-edit-btn"
                      onClick={() => openEditor(project)}
                      title="Editar proyecto"
                      aria-label={`Editar proyecto ${project.nombre}`}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && openEditor(project)
                      }
                    >
                      Editar
                    </button>
                  )}
                </td>
                <td role="cell">
                  <button
                    className="proyecto-desc-btn"
                    onClick={() => openDescription(project.descripcion)}
                    aria-label={`Ver descripción completa del proyecto ${project.nombre}`}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && openDescription(project.descripcion)
                    }
                  >
                    Ver descripción
                  </button>
                </td>
                <td role="cell">
                  {projectMembers[project.idProyecto]?.length || 0}
                  <button
                    className="proyecto-desc-btn"
                    onClick={() => openMembersModal(project)}
                    aria-label={`Ver miembros del proyecto ${project.nombre}`}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && openMembersModal(project)
                    }
                    style={{ marginLeft: "8px" }}
                  >
                    Ver miembros
                  </button>
                </td>

                {isPrevious && (
                  <td role="cell">{mapEstado(project.idEstadoProyecto)}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={isPrevious ? 6 : 5} className="proyectos-empty">
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
            aria-label="Crear nuevo proyecto"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
          >
            ➕ Nuevo proyecto
          </button>
        </div>
      )}

      {/* Description Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="modal-title">Descripción del proyecto</h3>
            <p id="modal-desc">{selectedDescription}</p>
            <br />
            <button
              className="proyecto-close-btn"
              onClick={closeModal}
              aria-label="Cerrar modal de descripción"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModalOpen && editedProject && (
        <div
          className="modal-overlay"
          onClick={closeEditor}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-modal-title"
          aria-describedby="edit-modal-desc"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="edit-modal-title">Editar proyecto</h3>
            <p id="edit-modal-desc">
              Formulario para modificar información del proyecto y miembros
            </p>

            <label htmlFor="project-name">
              Nombre del proyecto
              <input
                id="project-name"
                type="text"
                value={editedProject.nombre}
                onChange={(e) => handleFieldChange("nombre", e.target.value)}
              />
            </label>

            <label htmlFor="project-desc">
              Descripción
              <input
                id="project-desc"
                type="text"
                value={editedProject.descripcion}
                onChange={(e) =>
                  handleFieldChange("descripcion", e.target.value)
                }
              />
            </label>

            <label htmlFor="project-status">
              Estado del proyecto
              <select
                id="project-status"
                value={editedProject.idEstadoProyecto}
                onChange={(e) =>
                  handleFieldChange("idEstadoProyecto", Number(e.target.value))
                }
              >
                <option value={1}>En proceso</option>
                <option value={2}>Cancelado</option>
                <option value={3}>Finalizado</option>
              </select>
            </label>

            <h4>Miembros del proyecto</h4>
            <table
              className="members-table"
              role="table"
              aria-label="Miembros del proyecto"
            >
              <thead>
                <tr role="row">
                  <th role="columnheader">Nombre</th>
                  <th role="columnheader">Correo</th>
                  <th role="columnheader">Rol</th>
                  <th role="columnheader">Acción</th>
                </tr>
              </thead>
              <tbody>
                {editedProject.memberList?.map((member) => (
                  <tr key={member.id} role="row">
                    <td role="cell">{member.name}</td>
                    <td role="cell">{member.email}</td>
                    <td role="cell">{member.role}</td>
                    <td role="cell">
                      <button
                        className="small-danger"
                        onClick={() => handleRemoveMember(member.id)}
                        aria-label={`Eliminar miembro ${member.name}`}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleRemoveMember(member.id)
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}

                <tr className="add-member-row">
                  <td colSpan="4">
                    <div className="add-member">
                      <label className="sr-only" htmlFor="new-member-email">
                        Correo del nuevo miembro
                      </label>
                      <input
                        id="new-member-email"
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
                      <button
                        onClick={handleAddMember}
                        aria-label="Agregar nuevo miembro"
                      >
                        +
                      </button>
                    </div>
                    {addMemberError && (
                      <p className="error-message" role="alert">
                        {addMemberError}
                      </p>
                    )}
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
      {/* Members Modal */}
      {isMembersModalOpen && (
        <div
          className="modal-overlay"
          onClick={closeMembersModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="members-modal-title"
          aria-describedby="members-modal-desc"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="members-modal-title">Miembros de {selectedProjectName}</h3>
            <p id="members-modal-desc">
              Lista de miembros y roles del proyecto seleccionado.
            </p>

            {selectedProjectMembers.length > 0 ? (
              <table
                className="members-table"
                role="table"
                aria-label="Miembros del proyecto"
              >
                <thead>
                  <tr role="row">
                    <th role="columnheader">Nombre</th>
                    <th role="columnheader">Correo</th>
                    <th role="columnheader">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProjectMembers.map((member) => (
                    <tr key={member.id} role="row">
                      <td role="cell">{member.name}</td>
                      <td role="cell">{member.email}</td>
                      <td role="cell">{member.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay miembros en este proyecto.</p>
            )}

            <button
              className="proyecto-close-btn"
              onClick={closeMembersModal}
              aria-label="Cerrar modal de miembros"
              style={{ marginTop: "12px" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};