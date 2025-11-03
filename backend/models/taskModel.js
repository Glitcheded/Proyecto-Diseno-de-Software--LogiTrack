import { supabase } from '../supabaseClient.js';

export const formatTaskData = (data) => {
    return data
        .filter(item => item.Tarea) // Filtra tareas nulas
        .map(item => {
            const tarea = item.Tarea;
            return {
                id: tarea.idTarea,
                name: tarea.nombre,
                project: tarea.Proyecto?.nombre || 'Sin Proyecto',
                state: tarea.EstadoTarea?.nombre || 'Sin Estado',
                prioridad: tarea.idPrioridad,
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

// Obtiene todas las tareas asignadas a un usuario específico
export const getTareasPorUsuario = async (idUsuario) => {
    const { data, error } = await supabase
        .from('UsuarioPorTarea')
        .select(`
            Tarea (
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
            )
        `)
        .eq('idUsuario', idUsuario)
        .neq('Tarea.EstadoTarea.nombre', 'Hecho'); // Solo tareas activas

    if (error) throw error;
    
    // Formateamos los datos antes de devolverlos, justo como está en el frontend
    return formatTaskData(data);
};

// Crea una nueva tarea
export const crearTarea = async (taskData) => {
    const { data, error } = await supabase
        .from('Tarea')
        .insert(taskData)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

//Asigna un usuario a una tarea
export const asignarTarea = async (idUsuario, idTarea) => {
    const { error } = await supabase
        .from('UsuarioPorTarea')
        .insert({ idUsuario, idTarea });
    
    if (error) throw error;
};

//Obtiene una tarea por su ID
export const getTareaPorId = async (idTarea) => {
    const { data, error } = await supabase
        .from('Tarea')
        .select(`
            *,
            Proyecto ( nombre ),
            EstadoTarea ( nombre ),
            Prioridad ( nivel ),
            Comentario ( *, Usuario ( nombre, apellido ) ),
            UsuarioPorTarea ( Usuario ( idUsuario, nombre, apellido ) )
        `)
        .eq('idTarea', idTarea)
        .single();
    
    if (error) throw error;
    return data;
};

//Actualiza una tarea
export const actualizarTarea = async (idTarea, updates) => {
    const { data, error } = await supabase
        .from('Tarea')
        .update(updates)
        .eq('idTarea', idTarea)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

//Eliminar una tarea de manera lógica
export const eliminarTarea = async (idTarea) => {
    const { data, error } = await supabase
        .from('Tarea')
        .update({ activado: false })
        .eq('idTarea', idTarea);
        
    if (error) throw error;
    return data;
};

//Añadir un comentario a una tarea
export const crearComentario = async (idTarea, idUsuario, comentario) => {
    const { data, error } = await supabase
        .from('Comentario')
        .insert({ idTarea, idUsuario, comentario })
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

//Obtiene los miembros de una tarea
export const getMiembrosTarea = async (idTarea) => {
    const { data, error } = await supabase
        .from('UsuarioPorTarea')
        .select(`
            Usuario ( idUsuario, nombre, apellido, email ) 
        `)
        .eq('idTarea', idTarea);
        
    if (error) throw error;
    return data;
};

//Quita un usuario de una tarea
export const removerUsuarioDeTarea = async (idTarea, idUsuario) => {
    const { error } = await supabase
        .from('UsuarioPorTarea')
        .delete()
        .match({ idTarea: idTarea, idUsuario: idUsuario });
    
    if (error) throw error;
};