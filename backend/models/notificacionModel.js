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

// Crea notificaciones de proyectos
export async function insertarNotificacionProyecto(idProyecto, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificacionproyecto', {
    inidproyecto: idProyecto,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}

// Crea notificaciones de tareas
export async function insertarNotificacionTarea(idTarea, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificaciontarea', {
    inidtarea: idTarea,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}

// Crea notificaciones de sistema
export async function insertarNotificacionSistema(correo, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificacionsistema', {
    incorreousuario: correo,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}

