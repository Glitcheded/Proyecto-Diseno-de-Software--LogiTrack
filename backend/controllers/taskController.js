import * as taskModel from '../models/taskModel.js';
import { supabase } from "../supabaseClient.js";

//Obtiene las tareas del usuario logueado GET /api/tasks/mis-tareas
export const getMisTareas = async (req, res) => {
    try {
        const idUsuario = req.idUsuario; 

        const tareas = await taskModel.getTareasPorUsuario(idUsuario);
        
        res.status(200).json(tareas);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTareasPorProyecto = async (req, res) => {
  try {

    const { idProyecto } = req.params;

    if (!idProyecto) {
      return res.status(400).json({ error: "Falta el parámetro idProyecto" });
    }

    const tareas = await taskModel.getTareasPorProyecto(idProyecto);

    res.status(200).json(tareas);
  } catch (error) {
    console.error("Error fetching tareas por proyecto:", error.message);
    res.status(500).json({ error: error.message });
  }
};


//Crea una nueva tarea POST /api/tasks
export const crearTarea = async (req, res) => {
    try {
        const nuevaTarea = await taskModel.crearTarea(req.body);
        
        //Asigna al usuario que la creó
        const idUsuarioCreador = req.idUsuario;
        await taskModel.asignarTarea(idUsuarioCreador, nuevaTarea.idTarea);
        
        res.status(201).json(nuevaTarea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Obtiene una tarea específica por ID GET /api/tasks/:id
export const getTareaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const tarea = await taskModel.getTareaPorId(id);
        
        if (!tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        
        res.status(200).json(tarea);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Actualiza una tarea PUT /api/tasks/:id
export const actualizarTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const tareaActualizada = await taskModel.actualizarTarea(id, req.body);
        res.status(200).json(tareaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Elimina una tarea de manera lógica DELETE /api/tasks/:id
export const eliminarTarea = async (req, res) => {
    try {
        const { id } = req.params;
        await taskModel.eliminarTarea(id);
        res.status(200).json({ message: 'Tarea eliminada (marcada como inactiva)' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Asigna otro usuario a una tarea POST /api/tasks/:id/assign
export const asignarUsuarioATarea = async (req, res) => {
    try {
        const { id } = req.params; // id de la tarea
        const { idUsuario } = req.body; // id del usuario a asignar

        if (!idUsuario) {
            return res.status(400).json({ error: 'Se requiere idUsuario' });
        }

        await taskModel.asignarTarea(idUsuario, id);
        res.status(201).json({ message: 'Usuario asignado a la tarea' });

    } catch (error) {
        // Manejo de error por si la asignación ya existe
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El usuario ya está asignado a esta tarea' });
        }
        res.status(500).json({ error: error.message });
    }
};

//Añade un comentario a una tarea POST /api/tasks/:id/comment
export const agregarComentario = async (req, res) => {
    try {
        const { id } = req.params;
        const { comentario } = req.body;
        const idUsuario = req.idUsuario; // id del usuario que comenta

        if (!comentario) {
            return res.status(400).json({ error: 'El comentario no puede estar vacío' });
        }

        const nuevoComentario = await taskModel.crearComentario(id, idUsuario, comentario);
        res.status(201).json(nuevoComentario);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Obtiene los miembros de una tarea GET /api/tasks/:id/members
export const getMiembrosTarea = async (req, res) => {
    try {
        const { id } = req.params;
        const miembros = await taskModel.getMiembrosTarea(id);
        res.status(200).json(miembros);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Quita un miembro de una tarea DELETE /api/tasks/:idTarea/members/:idUsuario
export const removerMiembroTarea = async (req, res) => {
    try {
        const { idTarea, idUsuario } = req.params;
        await taskModel.removerUsuarioDeTarea(idTarea, idUsuario);
        res.status(200).json({ message: 'Usuario removido de la tarea' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// controllers/projects.js
export const getTasksByProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Project ID is required" });

    const { data, error } = await supabase
      .from("Tarea")
      .select(`
        idTarea,
        nombre,
        fechaEntrega,
        idEstadoTarea,
        EstadoTarea ( nombre ),
        idPrioridad,

        idTareaMadre,
        activado
      `)
      .eq("idProyecto", id)
      .eq("activado", true)
      .order("fechaEntrega", { ascending: true });

    if (error) throw error;

    // Map fields if needed for frontend
    const tasks = data.map((task) => ({
      id: task.idTarea,
      nombre: task.nombre,
      fechaEntrega: task.fechaEntrega,
      estado: task.EstadoTarea.nombre,
      idEstadoTarea: task.idEstadoTarea,
      prioridad: task.Prioridad.nombre,
      idPrioridad: task.idPrioridad,
      idTareaMadre: task.idTareaMadre,
      activado: task.activado,
    }));

    res.status(200).json(tasks);
  } catch (error) {
    console.error("[getTasksByProject] Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// controllers/tasks.js
export const getCommentsByTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Task ID is required" });

    const { data, error } = await supabase
      .from("Comentario")
      .select(`
        idComentario,
        comentario,
        idUsuario,
        Usuario ( nombre, apellido, email )
      `)
      .eq("idTarea", id)
      .order("idComentario", { ascending: true });

    if (error) throw error;

    const comments = data.map((c) => ({
      id: c.idComentario,
      comentario: c.comentario,
      idUsuario: c.idUsuario,
      nombreUsuario: `${c.Usuario.nombre} ${c.Usuario.apellido}`,
      emailUsuario: c.Usuario.email,
    }));

    res.status(200).json(comments);
  } catch (error) {
    console.error("[getCommentsByTask] Error:", error);
    res.status(500).json({ error: error.message });
  }
};
