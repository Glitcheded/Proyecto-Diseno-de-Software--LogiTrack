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