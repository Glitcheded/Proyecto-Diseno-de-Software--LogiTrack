import { crearChatPrivado, getChatsByCorreo } from '../models/chatModel.js';

// Controlador para obtener todos los chats
export async function obtenerChats(req, res) {
  const { correo } = req.params;

  try {
    const chats = await getChatsByCorreo(correo);
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error al obtener chats:', error.message);
    res.status(500).json({ error: 'No se pudieron obtener los chats' });
  }
}

// Controlador para crear un nuevo registro de chat privado
export async function crearChatPrivadoHandler(req, res) {
  try {
    const { correoUsuario1, correoUsuario2 } = req.body;

    if (!correoUsuario1 || !correoUsuario2) {
      return res.status(400).json({ error: 'Debes proporcionar ambos correos de usuario.' });
    }

    const resultado = await crearChatPrivado(correoUsuario1, correoUsuario2);

    res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error al crear chat privado:', error.message);
    res.status(500).json({ error: error.message });
  }
}
