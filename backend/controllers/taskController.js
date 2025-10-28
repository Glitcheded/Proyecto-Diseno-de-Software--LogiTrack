import * as taskModel from '../models/taskModel.js';

//Obtiene las tareas del usuario logueado GET /api/tasks/mis-tareas
export const getMisTareas = async (req, res) => {
    try {
        // req.idUsuario nos lo da el middleware 'checkAuth'
        const idUsuario = req.idUsuario; 

        const tareas = await taskModel.getTareasPorUsuario(idUsuario);
        
        res.status(200).json(tareas);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};