import { supabase } from '../supabaseClient.js';

export const formatTaskData = (data) => {
  return data
    .filter(item => item.Tarea) // Filtra tareas nulas
    .map(item => {
      const tarea = item.Tarea;
      return {
        id: tarea.idTarea,
        name: tarea.nombre,
        project: {
          id: tarea.Proyecto?.idProyecto || null,
          name: tarea.Proyecto?.nombre || "Sin Proyecto",
        },
        state: tarea.EstadoTarea?.nombre || "Sin Estado",
        prioridad: tarea.Prioridad,
        dueDate: tarea.fechaEntrega,
        members: tarea.UsuarioPorTarea.map(upt => ({
          id: upt.Usuario.idUsuario,
          name: `${upt.Usuario.nombre} ${upt.Usuario.apellido}`.trim(),
        })),
        comments: tarea.Comentario.map(c => ({
          id: c.idComentario,
          authorId: c.Usuario.idUsuario,
          author: `${c.Usuario.nombre} ${c.Usuario.apellido}`.trim(),
          text: c.comentario,
        })),
        subtaskOf: tarea.idTareaMadre,
      };
    });
};

// Fetches all tasks assigned to a specific user
export const getTareasPorUsuario = async (idUsuario) => {
  const { data, error } = await supabase
    .from("UsuarioPorTarea")
    .select(`
      Tarea (
        idTarea,
        nombre,
        fechaEntrega,
        idTareaMadre,
        Proyecto (
          idProyecto,
          nombre
        ),
        EstadoTarea ( nombre ),
        Prioridad ( nivel ),
        Comentario (
          idComentario,
          comentario,
          Usuario ( idUsuario, nombre, apellido )
        ),
        UsuarioPorTarea (
          Usuario ( idUsuario, nombre, apellido )
        )
      )
    `)
    .eq("idUsuario", idUsuario)
    .eq("Tarea.activado", true);

  if (error) throw error;

  return formatTaskData(data);
};


export const getTareasPorProyecto = async (idProyecto) => {
  const { data, error } = await supabase
    .from("Tarea")
    .select(`
      idTarea,
      nombre,
      fechaEntrega,
      idTareaMadre,
      Proyecto (
          idProyecto,
          nombre
        ),
      EstadoTarea ( nombre ),
      Prioridad ( nivel ),
      Comentario (
        idComentario,
        comentario,
        Usuario ( idUsuario, nombre, apellido )
      ),
      UsuarioPorTarea (
        Usuario ( idUsuario, nombre, apellido )
      )
    `)
    .eq("idProyecto", idProyecto)
    .eq("activado", true)
    

  if (error) throw error;

  return formatTaskData(data.map(t => ({ Tarea: t })));
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

//Obtiene los miembros de un proyecto
export const getMiembrosProyecto = async (idProyecto) => {
  const { data, error } = await supabase
    .from("UsuarioPorProyecto")
    .select(`
      Usuario (
        idUsuario,
        nombre,
        apellido,
        email
      )
    `)
    .eq("idProyecto", idProyecto);

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