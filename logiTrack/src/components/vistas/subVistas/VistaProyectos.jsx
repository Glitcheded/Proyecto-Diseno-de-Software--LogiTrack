import React, { useState, useEffect } from "react";
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

  const [addMemberError, setAddMemberError] = useState("");

  // Map to hold project members: { [idProyecto]: [members...] }
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

  // Fetch members for a project
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

  // Fetch members for all projects on mount
  useEffect(() => {
    dataList.forEach((project) => fetchMembers(project.idProyecto));
  }, [dataList]);

  const openDescription = (description) => {
    setSelectedDescription(description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDescription(null);
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
      // Call your new API route to get user info by email
      const res = await fetch(
        `http://localhost:3001/api/config/email/${email}`
      );
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
      setAddMemberError(""); // clear error if successful
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

      // 1️⃣ Update project info (name & description)
      await fetch(`${baseURL}/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          nombre: editedProject.nombre,
          descripcion: editedProject.descripcion,
          idEstadoProyecto: editedProject.idEstadoProyecto, // ✅ include state
        }),
      });

      // 2️⃣ Handle member removals
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

      // 3️⃣ Handle newly added members
      const addedMembers = editedProject.memberList.filter(
        (m) => !originalMembers.some((om) => om.id === m.id)
      );

      for (const member of addedMembers) {
        // Here we now send idUsuario + idRol (instead of just email)
        await fetch(`${baseURL}/${projectId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            idUsuario: member.id,
            idRol: member.role, // ⚠️ make sure this is the role ID, not the name
          }),
        });
      }

      // 4️⃣ Update local state
      setDataList((prev) =>
        prev.map((proj) =>
          proj.idProyecto === projectId ? editedProject : proj
        )
      );
      setProjectMembers((prev) => ({
        ...prev,
        [projectId]: editedProject.memberList,
      }));

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

      const res = await fetch(
        `http://localhost:3001/api/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar proyecto");
      }

      console.log(`Proyecto ${projectId} eliminado correctamente`);

      // 🔹 Eliminar localmente del estado para reflejar el cambio en UI
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
      // Add the current user as the first member
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

      console.log("Proyecto creado:", projectForTable);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

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
          {dataList.length > 0 ? (
            dataList.map((project) => (
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
                <td>{formatDate(project.ultimaModificacion)}</td>
                <td>
                  {isPrevious
                    ? formatDate(project.fechaFinalizacion)
                    : formatDate(project.fechaEntregaProxima)}
                </td>
                <td>{projectMembers[project.idProyecto]?.length || 0}</td>
                {isPrevious ? (
                  <td>{mapEstado(project.idEstadoProyecto)}</td>
                ) : null}
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

            <label>
              Estado del proyecto
              <select
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
                    {addMemberError && (
                      <p className="error-message">{addMemberError}</p>
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
    </div>
  );
};
