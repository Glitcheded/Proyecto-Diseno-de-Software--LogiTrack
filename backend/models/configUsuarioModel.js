import { supabase } from '../supabaseClient.js';

// Obtener las configuraciones actuales del usuario (los toggles)
export async function obtenerConfiguracionPorUsuario(idUsuario) {
  const { data, error } = await supabase
    .from('ConfiguracionUsuario')
    .select('*')
    .eq('idUsuario', idUsuario);

  if (error) throw error;
  return data;
}

// Actualizar cambios a configuraciones (los toggles) 
export async function actualizarConfiguracionUsuario(idUsuario, nuevosValores) {
  const { data, error } = await supabase
    .from('ConfiguracionUsuario')
    .update(nuevosValores)
    .eq('idUsuario', idUsuario)
    .select();

  if (error) throw error;
  return data;
}

// Actualizar cambios de usuario (nombre, correo, etc)
// !usar upsert 

