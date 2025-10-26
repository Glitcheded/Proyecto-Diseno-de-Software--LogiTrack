import { supabase } from '../supabaseClient.js';

// Inserta en la tabla "Usuario"
export async function crearUsuarioLocal(nombre, apellido, email) {
  const { data, error } = await supabase
    .from('Usuario')
    .insert({
      nombre: nombre,
      apellido: apellido || '',
      email: email,
      contrasena: 'AuthManejado'
    })
    .select('idUsuario')
    .single();

  if (error) throw error;
  return data;
}

// Inserta la configuración por defecto para ese nuevo usuario
export async function crearConfiguracionDefault(idUsuario) {
  const { error } = await supabase
    .from('ConfiguracionUsuario')
    .insert({ idUsuario: idUsuario });

  if (error) throw error;
}