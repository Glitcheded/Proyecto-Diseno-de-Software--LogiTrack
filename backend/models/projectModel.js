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
        query = query.neq('idEstadoTarea', 3);
    } else if (taskState === 'Terminadas') {
        query = query.eq('idEstadoTarea', 3);
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
        'get_proyectos_completos_con_fecha_proxima', // updated function name
        { p_id_usuario: idUsuario }
    );
    console.log(data)

    if (error) throw error;
    return data;
};

//Obtiene los miembros de un proyecto
export const getMiembrosProyecto = async (idProyecto) => {
    const { data, error } = await supabase
        .from('UsuarioPorProyecto')
        .select(`
            Rol ( nombre ),
            Usuario ( idUsuario, nombre, apellido, email ) 
        `)
        .eq('idProyecto', idProyecto);
        
    if (error) throw error;
    return data;
};

//Quitar un usuario de un proyecto
export const removerUsuarioDeProyecto = async (idProyecto, idUsuario) => {
    const { error } = await supabase
        .from('UsuarioPorProyecto')
        .delete()
        .match({ idProyecto: idProyecto, idUsuario: idUsuario });
    
    if (error) throw error;
};

// 1. Formatter function
const formatEntradaBitacora = (entrada) => ({
    id: entrada.idEntradaBitacora,
    startTime: entrada.horaInicio || null,
    finishTime: entrada.horaFinalizacion || null,
    tasks: entrada.tareas || '',
    notes: entrada.notas || '',
});

// 2. Main function to get entradas
export const getEntradasBitacoraPorProyectoYFecha = async (idProyecto, fecha) => {
    // Find the Bitacora(s) for that project and date
    const { data: bitacoras, error: bitacoraError } = await supabase
        .from('Bitacora')
        .select('idBitacora')
        .eq('idProyecto', idProyecto)
        .eq('fecha', fecha);

    if (bitacoraError) throw bitacoraError;
    if (!bitacoras || bitacoras.length === 0) return [];

    const bitacoraIds = bitacoras.map(b => b.idBitacora);

    // Get all EntradaBitacora for those Bitacora IDs
    const { data: entradas, error: entradasError } = await supabase
        .from('EntradaBitacora')
        .select('*')
        .in('idBitacora', bitacoraIds)
        .order('horaInicio', { ascending: true });

    if (entradasError) throw entradasError;

    // Map each entry to the desired format
    return entradas.map(formatEntradaBitacora);
};

export const updateEntradaBitacora = async (idEntradaBitacora, camposActualizados) => {
  const { data, error } = await supabase
    .from('EntradaBitacora')
    .update({
      horaInicio: camposActualizados.horaInicio,
      horaFinalizacion: camposActualizados.horaFinalizacion,
      tareas: camposActualizados.tareas,
      notas: camposActualizados.notas,
    })
    .eq('idEntradaBitacora', idEntradaBitacora)
    .select('*') // Return the updated row
    .single();

  if (error) throw error;
  return data;
};

// Helper function to format local time as "HH:mm:00"
const getCurrentLocalTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}:00`;
};

export const createEntradaBitacora = async (idProyecto, fecha) => {
  // Step 1: Check if there is an existing Bitacora for the project and date
  let { data: bitacoras, error: bitacoraError } = await supabase
    .from("Bitacora")
    .select("idBitacora")
    .eq("idProyecto", idProyecto)
    .eq("fecha", fecha);

  if (bitacoraError) throw bitacoraError;

  let idBitacora;

  // Step 2: If none found, create a new Bitacora row
  if (!bitacoras || bitacoras.length === 0) {
    const { data: newBitacora, error: createBitacoraError } = await supabase
      .from("Bitacora")
      .insert([{ idProyecto, fecha }])
      .select("idBitacora")
      .single();

    if (createBitacoraError) throw createBitacoraError;
    idBitacora = newBitacora.idBitacora;
  } else {
    idBitacora = bitacoras[0].idBitacora;
  }

  // Step 3: Create the new EntradaBitacora
  const horaInicio = getCurrentLocalTime();

  const { data: nuevaEntrada, error: entradaError } = await supabase
    .from("EntradaBitacora")
    .insert([
      {
        idBitacora,
        horaInicio,
        horaFinalizacion: null,
        tareas: "",
        notas: "",
      },
    ])
    .select("*")
    .single();

  if (entradaError) throw entradaError;

  return {
    id: nuevaEntrada.idEntradaBitacora,
    startTime: nuevaEntrada.horaInicio,
    finishTime: nuevaEntrada.horaFinalizacion,
    tasks: nuevaEntrada.tareas,
    notes: nuevaEntrada.notas,
  };
};