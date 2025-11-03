import { supabase } from '../supabaseClient.js';

// Funcion para obtener todos los chats
export async function getChatsByCorreo(correoUsuario) {
  const { data, error } = await supabase.rpc('getchats', {
    incorreousuario: correoUsuario,
  });

  if (error) throw error;
  return data;
}

// Funcion para crear un nuevo registro de chat privado
export async function crearChatPrivado(correoUsuario1, correoUsuario2) {
  const { data, error } = await supabase.rpc('crearchatprivado', {
    incorreousuario1: correoUsuario1,
    incorreousuario2: correoUsuario2,
  });

  if (error) throw error;
  return data;
}

// Insertar mensajes
export async function insertarMensaje(idUsuario, idChat, contenido) {
  const fechaHora = new Date().toISOString();

  const { data, error } = await supabase
    .from('Mensaje')
    .insert([
      {
        idUsuario,
        idChat,
        contenido,
        fechaHora,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}

export async function obtenerMensajesPorChat(idChat) {
  const { data, error } = await supabase
    .from("Mensaje")
    .select(`
      contenido,
      fechaHora,
      Usuario: idUsuario (nombre)
    `)
    .eq("idChat", idChat)
    .order("fechaHora", { ascending: true });

  if (error) {
    throw new Error(`Error al obtener mensajes: ${error.message}`);
  }

  return data;
}
