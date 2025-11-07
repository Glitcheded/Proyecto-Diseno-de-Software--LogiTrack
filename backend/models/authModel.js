import { supabase } from '../supabaseClient.js';

// Inserta en la tabla "Usuario"
export async function crearUsuarioLocal(nombre, apellidos, email) { // Asumo que mantienes el dbClient de la otra vez
    const { data, error } = await supabase
    .from('Usuario')
    .insert({
      nombre: nombre,
      apellido: apellidos,
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