import { supabase } from '../supabaseClient.js';

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
export async function insertarNotificacionProyecto(correo, idProyecto, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificacionproyecto', {
    incorreousuario: correo,
    inidproyecto: idProyecto,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}