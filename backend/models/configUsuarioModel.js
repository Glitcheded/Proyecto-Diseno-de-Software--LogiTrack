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
  if ('idConfiguracionUsuario' in nuevosValores || 'idUsuario' in nuevosValores 
    || 'contrasena' in nuevosValores || 'activado' in nuevosValores) {
    throw new Error('Los campos "idConfiguracionUsuario" y "idUsuario" no pueden ser modificados.');
  }

  const { data, error } = await supabase
    .from('ConfiguracionUsuario')
    .update(nuevosValores)
    .eq('idUsuario', idUsuario)
    .select();

  if (error) throw error;
  return data;
}

// Actualizar cambios de usuario (nombre, correo, etc)
export async function actualizarUsuario(idUsuario, camposActualizados) {
  if ('email' in camposActualizados || 'idUsuario' in camposActualizados 
    || 'contrasena' in camposActualizados || 'activado' in camposActualizados) {
    throw new Error('Los campos "email", "idUsuario","contrasena" y "activado" no pueden ser modificados.');
  }

  const { data, error } = await supabase
    .from('Usuario')
    .update(camposActualizados)
    .eq('idUsuario', idUsuario)
    .select();

  if (error) throw error;
  return data;
}


