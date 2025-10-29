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