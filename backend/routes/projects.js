// backend/routes/projects.js
import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// Función helper para formatear (evita repetir código)
const formatTaskData = (data) => {
    return data
        .filter(item => item.Tarea) // Filtra nulos
        .map(item => {
            const tarea = item.Tarea;
            return {
                id: tarea.idTarea,
                name: tarea.nombre,
                project: tarea.Proyecto?.nombre || 'Sin Proyecto',
                state: tarea.EstadoTarea?.nombre || 'Sin Estado',
                prioridad: tarea.Prioridad?.nivel || 'Sin Prioridad',
                dueDate: tarea.fechaEntrega,
                members: tarea.UsuarioPorTarea.map(upt => 
                    `${upt.Usuario.nombre} ${upt.Usuario.apellido}`.trim()
                ),
                comments: tarea.Comentario.map(c => ({
                    author: `${c.Usuario.nombre} ${c.Usuario.apellido}`.trim(),
                    text: c.comentario
                })),
                subtaskOf: tarea.idTareaMadre
            };
        });
};


// Endpoint genérico para obtener tareas de proyectos
const getProjectTasks = async (req, res, taskState) => {
    try {
        // 1. Obtener el token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No autorizado: Sin token' });
        }

        // 2. Verificar el token (nos da el email)
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'No autorizado: Token inválido' });
        }

        // 3. PASO EXTRA: Traducir email a idUsuario (bigint)
        const { data: usuarioLocal, error: localError } = await supabase
            .from('Usuario')
            .select('idUsuario')
            .eq('email', user.email)
            .single();

        if (localError || !usuarioLocal) {
            return res.status(404).json({ error: "Usuario de Auth no encontrado en tabla 'Usuario' local" });
        }

        const idUsuarioLogueado = usuarioLocal.idUsuario; // Este es tu bigint

        // 4. Obtener los IDs de los proyectos donde el usuario es miembro
        const { data: proyectosUsuario, error: proyError } = await supabase
            .from('UsuarioPorProyecto')
            .select('idProyecto')
            .eq('idUsuario', idUsuarioLogueado);

        if (proyError) throw proyError;

        // Si el usuario no está en ningún proyecto, devuelve array vacío
        if (!proyectosUsuario || proyectosUsuario.length === 0) {
            return res.status(200).json([]);
        }

        const idProyectos = proyectosUsuario.map(p => p.idProyecto);

        // 5. Obtener las TAREAS de ESOS proyectos, filtrando por el estado deseado
        // Nota: Tenemos que consultar 'Tarea' y filtrar por 'EstadoTarea.nombre'
        
        let query = supabase
            .from('Tarea')
            .select(`
                idTarea,
                nombre,
                fechaEntrega,
                idTareaMadre,
                Proyecto ( nombre ),
                EstadoTarea ( nombre ),
                Prioridad ( nivel ),
                Comentario ( 
                    comentario,
                    Usuario ( nombre, apellido )
                ),
                UsuarioPorTarea (
                    Usuario ( nombre, apellido )
                )
            `)
            .in('idProyecto', idProyectos); // Solo de los proyectos del usuario

        // Aplicamos el filtro de estado
        if (taskState === 'Activas') {
            query = query.neq('EstadoTarea(nombre)', 'Terminado');
        } else if (taskState === 'Terminadas') {
            query = query.eq('EstadoTarea(nombre)', 'Terminado');
        }

        const { data, error } = await query;
        if (error) throw error;
        
        // 6. Formatear y enviar
        const tareasFormateadas = formatTaskData(data.map(item => ({ Tarea: item })));
        res.status(200).json(tareasFormateadas);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// GET /api/projects/mis-proyectos
router.get('/mis-proyectos', (req, res) => {
    getProjectTasks(req, res, 'Activas'); // Llama al helper pidiendo tareas Activas
});

// GET /api/projects/anteriores
router.get('/anteriores', (req, res) => {
    getProjectTasks(req, res, 'Terminadas'); // Llama al helper pidiendo tareas Terminadas
});

export default router;