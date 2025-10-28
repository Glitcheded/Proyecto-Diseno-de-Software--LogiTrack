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
        .neq('Tarea.EstadoTarea.nombre', 'Terminado'); // Solo tareas activas

    if (error) throw error;
    
    // Formateamos los datos antes de devolverlos, justo como está en el frontend
    return formatTaskData(data);
};