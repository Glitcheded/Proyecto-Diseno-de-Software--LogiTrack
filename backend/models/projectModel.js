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

//Obtiene las tareas de un proyecto, buscado por su nombre
export const getTareasPorNombreProyecto = async (nombreProyecto) => {
    // 1. Encontrar el ID del proyecto a partir de su nombre
    const { data: proyecto, error: projError } = await supabase
        .from('Proyecto')
        .select('idProyecto')
        .eq('nombre', nombreProyecto)
        .single();
    
    if (projError || !proyecto) {
        throw new Error('Proyecto no encontrado con ese nombre');
    }

    // Obtener las tareas de ese ID de proyecto
    let { data, error } = await supabase
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
        .eq('idProyecto', proyecto.idProyecto);
    
    if (error) throw error;

    // Formatea y devuelve
    return formatTaskData(data.map(item => ({ Tarea: item })));
};

export const crearProyecto = async (projectData) => {
    const { data, error } = await supabase
        .from('Proyecto')
        .insert(projectData)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

//Asinga un usuario a un proyecto con rol
export const asignarProyecto = async (idUsuario, idProyecto, idRol) => {
    const { error } = await supabase
        .from('UsuarioPorProyecto')
        .insert({ idUsuario, idProyecto, idRol });
    
    if (error) throw error;
};

//Obtiene un proyecto por su ID
export const getProyectoPorId = async (idProyecto) => {
    const { data, error } = await supabase
        .from('Proyecto')
        .select(`
            *,
            EstadoProyecto ( nombre ),
            UsuarioPorProyecto ( 
                Rol ( nombre ),
                Usuario ( idUsuario, nombre, apellido, email, enlaceLikedIn ) 
            )
        `)
        .eq('idProyecto', idProyecto)
        .single();
        
    if (error) throw error;
    return data;
};

//Actualiza un proyecto
export const actualizarProyecto = async (idProyecto, updates) => {
    const { data, error } = await supabase
        .from('Proyecto')
        .update(updates)
        .eq('idProyecto', idProyecto)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

//Elimina un proyecto de manera lógica
export const eliminarProyecto = async (idProyecto) => {
    const { data, error } = await supabase
        .from('Proyecto')
        .update({ activado: false })
        .eq('idProyecto', idProyecto);
        
    if (error) throw error;
    return data;
};


//Obtiene los proyectos de un usuariovcon la fecha de entrega más próxima de tareas.
//Llama a una función RPC de Supabase.
export const getProyectosPorUsuario = async (idUsuario) => {
    const { data, error } = await supabase.rpc(
        'get_proyectos_con_fecha_proxima', 
        { p_id_usuario: idUsuario }
    );

    if (error) throw error;
    return data;
};