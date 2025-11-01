import { supabase } from '../supabaseClient.js';

export async function getNotificacionesPorUsuario(correo) {
  const { data, error } = await supabase.rpc('getnotificacionesporusuario', {
    incorreousuario: correo
  });

  if (error) throw error;
  return data;
}
