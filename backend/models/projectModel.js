import { supabase } from '../supabaseClient.js';
// Importamos el formateador que creamos en el taskModel
import { formatTaskData } from './taskModel.js'; 

// Obtener los IDs de los proyectos en los que un usuario está
export const getProyectoIDsPorUsuario = async (idUsuario) => {
    const { data, error } = await supabase
        .from('UsuarioPorProyecto')
        .select('idProyecto')
        .eq('idUsuario', idUsuario);
    
    if (error) throw error;
    
    // Si no está en proyectos, devuelve array vacío
    if (!data || data.length === 0) {
        return [];
    }
    
    // Devuelve un array de IDs
    return data.map(p => p.idProyecto);
};

// Obtener las tareas de un conjunto de proyectos, filtrando por estado
export const getTareasPorProyectoIDs = async (idProyectos, taskState) => {
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
        query = query.neq('EstadoTarea.nombre', 'Terminado');
    } else if (taskState === 'Terminadas') {
        query = query.eq('EstadoTarea.nombre', 'Terminado');
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Reutilizamos el formateador
    return formatTaskData(data.map(item => ({ Tarea: item })));
};