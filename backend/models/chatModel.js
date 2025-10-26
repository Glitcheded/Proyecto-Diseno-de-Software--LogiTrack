import { supabase } from '../supabaseClient.js';

//Funcion para crear un nuevo registro de chat
export async function nuevoChat({ esGrupo, nombreChat }) {
  const { data, error } = await supabase
    .from('Chat')
    .insert([{ esGrupo, nombreChat }])
    .select();

  if (error) throw new Error(error.message);
  return data;
}