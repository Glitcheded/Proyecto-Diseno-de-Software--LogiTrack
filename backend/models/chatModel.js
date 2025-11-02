import { supabase } from '../supabaseClient.js';

// Funcion para crear un nuevo registro de chat privado
export async function crearChatPrivado(correoUsuario1, correoUsuario2) {
  const { data, error } = await supabase.rpc('crearchatprivado', {
    incorreousuario1: correoUsuario1,
    incorreousuario2: correoUsuario2,
  });

  if (error) throw error;
  return data;
}
