import * as projectModel from '../models/projectModel.js';

// Obtiene tareas de proyectos
export const getProjectTasks = async (req, res, taskState) => {
    try {
        // Obtiene el idUsuario del middleware
        const idUsuario = req.idUsuario;

        // Obtiene  los IDs de los proyectos del usuario
        const idProyectos = await projectModel.getProyectoIDsPorUsuario(idUsuario);

        // Si no está en proyectos, devuelve array vacío
        if (idProyectos.length === 0) {
            return res.status(200).json([]);
        }

        // Obtiene las tareas de los proyectos
        const tareas = await projectModel.getTareasPorProyectoIDs(idProyectos, taskState);

        // Formatea y envia
        res.status(200).json(tareas);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtiene las tareas de proyectos activos GET /api/projects/mis-proyectos
export const getMisProyectos = (req, res) => {
    getProjectTasks(req, res, 'Activas');
};

// Obtiene las tareas de proyectos terminados GET /api/projects/anteriores
export const getProyectosAnteriores = (req, res) => {
    getProjectTasks(req, res, 'Terminadas');
};

// Crea un nuevo proyecto POST /api/projects
export const crearProyecto = async (req, res) => {
    try {
        // Crea el proyecto
        const nuevoProyecto = await projectModel.crearProyecto(req.body);
        
        // Asigna al usuario que lo creó como Administrador
        const idUsuarioCreador = req.idUsuario;
        const idRolAdmin = 1;
        
        await projectModel.asignarProyecto(idUsuarioCreador, nuevoProyecto.idProyecto, idRolAdmin);
        
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

//Obtiene un proyecto específico por ID GET /api/projects/:id
export const getProyectoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const proyecto = await projectModel.getProyectoPorId(id);
        
        if (!proyecto) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        
        res.status(200).json(proyecto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Obtiene las tareas por nombre de proyecto GET /api/projects/por-nombre/:nombreProyecto
export const getTareasPorNombre = async (req, res) => {
    try {
        const { nombreProyecto } = req.params;
        const tareas = await projectModel.getTareasPorNombreProyecto(nombreProyecto);
        res.status(200).json(tareas);
    } catch (error) {
        if (error.message.includes('Proyecto no encontrado')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

//Actualiza un proyecto PUT /api/projects/:id
export const actualizarProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const proyectoActualizado = await projectModel.actualizarProyecto(id, req.body);
        res.status(200).json(proyectoActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Eliminar un proyecto DELETE /api/projects/:id
export const eliminarProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        await projectModel.eliminarProyecto(id);
        res.status(200).json({ message: 'Proyecto eliminado (marcado como inactivo)' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Asignar un usuario a un proyecto POST /api/projects/:id/assign
export const asignarUsuarioAProyecto = async (req, res) => {
  try {
    console.log("📩 [asignarUsuarioAProyecto] Request received");

    const { id } = req.params; // id del proyecto
    const { idUsuario, idRol } = req.body; // puede venir como número o nombre
    console.log("➡️ Proyecto ID:", id);
    console.log("👤 idUsuario:", idUsuario);
    console.log("🎭 idRol recibido:", idRol);

    // 🔹 Mapeo de roles por nombre → ID numérico
    const roleMap = {
      "Administrador": 1,
      "Gestor de Proyectos": 2,
      "Colaborador": 3,
      "Observador": 4,
    };

    // Si el idRol es string, conviértelo usando el mapa
    const numericRol = isNaN(idRol) ? roleMap[idRol] : Number(idRol);

    if (!numericRol) {
      console.error("❌ Rol inválido:", idRol);
      return res.status(400).json({ error: `Rol inválido: ${idRol}` });
    }

    console.log("✅ Rol numérico final:", numericRol);
    console.log("🧠 Llamando projectModel.asignarProyecto...");

    // Ejecuta la asignación
    await projectModel.asignarProyecto(idUsuario, id, numericRol);

    console.log("✅ Usuario asignado correctamente al proyecto");
    res.status(201).json({ message: "Usuario asignado al proyecto" });

  } catch (error) {
    console.error("🔥 Error en asignarUsuarioAProyecto:", error.message);
    res.status(500).json({ error: error.message });
  }
};



//Obtiene los datos de los proyectos del usuario GET /api/projects/datos-proyectos
export const getMisProyectosDatos = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        const proyectos = await projectModel.getProyectosPorUsuario(idUsuario);
        res.status(200).json(proyectos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Obtiene los miembros de un proyecto GET /api/projects/:id/members
export const getMiembrosProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const miembros = await projectModel.getMiembrosProyecto(id);
        res.status(200).json(miembros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Quitar un miembro de un proyecto DELETE /api/projects/:idProyecto/members/:idUsuario
export const removerMiembroProyecto = async (req, res) => {
    try {
        const { idProyecto, idUsuario } = req.params;
        await projectModel.removerUsuarioDeProyecto(idProyecto, idUsuario);
        res.status(200).json({ message: 'Usuario removido del proyecto' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};