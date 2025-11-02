import { supabase } from '../supabaseClient.js';

export async function getNotificacionesPorUsuario(correo) {
  const { data, error } = await supabase.rpc('getnotificacionesporusuario', {
    incorreousuario: correo
  });

  if (error) throw error;
  return data;
}

export async function insertarNotificacionChat(correo, idChat, descripcion) {
  const { data, error } = await supabase.rpc('insertnotificacionchat', {
    incorreousuario: correo,
    inidchat: idChat,
    indescripcion: descripcion
  });

  if (error) throw error;
  return data;
}

