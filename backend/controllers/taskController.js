import * as taskModel from '../models/taskModel.js';

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