import { supabase } from '../supabaseClient.js';

// Obtiene las categorias de notificaciones
export async function getTodasLasCategorias() {
  const { data, error } = await supabase
    .from('CategoriaNotificacion')
    .select('*');

  if (error) throw error;
  return data;
}

// Obtiene las notificaciones segun la categoria
export async function getNotificacionesRecientesPorCategoria(idUsuario, idCategoria) {
  const { data, error } = await supabase.rpc('getnotificacionesporcategoria', {
    in_id_usuario: idUsuario,
    in_id_categoria: idCategoria,
  });

  if (error) throw error;
  return data;
}

// Obtiene las notificaciones de los ultimos 15 dias
export async function getNotificacionesPorUsuario(correo) {
  const { data, error } = await supabase.rpc('getnotificacionesporusuario', {
    incorreousuario: correo
  });

  if (error) throw error;
  return data;
}

// Crea notificaciones de chat
export async function insertarNotificacionChat(correo, idChat, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificacionchat', {
    incorreousuario: correo,
    inidchat: idChat,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}

const ID_CATEGORIA_PROYECTO = 2;
const ID_CATEGORIA_TAREA = 1;

// Crea notificaciones de proyectos
export async function insertarNotificacionProyecto(idProyecto, descripcion) {
  
  //Encuentra a todos los miembros del proyecto
  const { data: miembros, error: errMiembros } = await supabase
    .from('UsuarioPorProyecto')
    .select('idUsuario')
    .eq('idProyecto', idProyecto);

  if (errMiembros) throw errMiembros;
  if (!miembros || miembros.length === 0) {
    console.warn(`Intento de notificar al proyecto ${idProyecto} sin miembros.`);
    return;
  }

  const notificacionesParaInsertar = miembros.map(miembro => ({
    idUsuario: miembro.idUsuario,
    idCategoriaNotificacion: ID_CATEGORIA_PROYECTO,
    fechaHora: new Date().toISOString(),
    descripcion: descripcion,
    activado: true
  }));

  const { error } = await supabase
    .from('Notificacion')
    .insert(notificacionesParaInsertar);

  if (error) throw error;
  return { mensaje: `Notificaciones creadas para ${miembros.length} usuarios.` };
}

// Crea notificaciones de tareas
export async function insertarNotificacionTarea(idTarea, descripcion) {
  
  const { data: miembros, error: errMiembros } = await supabase
    .from('UsuarioPorTarea')
    .select('idUsuario')
    .eq('idTarea', idTarea);

  if (errMiembros) throw errMiembros;
  if (!miembros || miembros.length === 0) {
     console.warn(`Intento de notificar a la tarea ${idTarea} sin miembros asignados.`);
    return; 
  }

  const notificacionesParaInsertar = miembros.map(miembro => ({
    idUsuario: miembro.idUsuario,
    idCategoriaNotificacion: ID_CATEGORIA_TAREA,
    fechaHora: new Date().toISOString(),
    descripcion: descripcion,
    activado: true
  }));

  const { error } = await supabase
    .from('Notificacion')
    .insert(notificacionesParaInsertar);

  if (error) throw error;
  return { mensaje: `Notificaciones creadas para ${miembros.length} usuarios.` };
}

export async function insertarNotificacionSistema(correo, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificacionsistema', {
    incorreousuario: correo,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}

// Borra notificaciones
export async function borrarNotificacionesPorId(ids) {
  const { error } = await supabase
    .from('Notificacion')
    .delete()
    .in('idNotificacion', ids);

  if (error) throw error;
  return { mensaje: `Se eliminaron ${ids.length} notificaciones.` };
}

export async function desactivarNotificacionPorId(idNotificacion) {
  const { data, error } = await supabase
    .from('Notificacion')
    .update({ activado: false })
    .eq('idNotificacion', idNotificacion)
    .select(); // optional, returns updated row

  if (error) throw error;
  return data;
}