import { crearChatPrivado, getChatsByCorreo, insertarMensaje, obtenerMensajesPorChat,
  crearChatGrupalModel, eliminarChat
  } from '../models/chatModel.js';

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

// Controlador para crear un nuevo registro de chat grupal
export async function crearChatGrupal(req, res) {
  try {
    const { correos, nombreGrupo } = req.body

    if (!nombreGrupo || typeof nombreGrupo !== 'string' || nombreGrupo.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un nombre válido para el grupo en el campo "nombreGrupo".'
      });
    }

    // Validación básica
    if (!correos || !Array.isArray(correos) || correos.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar al menos dos correos en el arreglo "correos".'
      })
    }

    // Llamar al modelo
    const data = await crearChatGrupalModel(correos, nombreGrupo || null)

    res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Error en crearChatGrupal:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno al crear chat grupal.',
      error: error.message
    })
  }
}

export async function crearMensaje(req, res) {
  try {
    const { idUsuario, idChat, contenido } = req.body;

    if (!idUsuario || !idChat || !contenido) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const data = await insertarMensaje(idUsuario, idChat, contenido);
    return res.status(201).json(data);
  } catch (error) {
    console.error('Error en crearMensaje:', error);
    return res.status(500).json({ error: error.message }); // ✅ JSON correcto
  }
}

export async function listarMensajesPorChat(req, res) {
  try {
    const { idChat } = req.params;

    if (!idChat) {
      return res.status(400).json({ error: "Falta el parámetro idChat" });
    }

    const mensajes = await obtenerMensajesPorChat(idChat);
    res.status(200).json(mensajes);
  } catch (error) {
    console.error("Error en listarMensajesPorChat:", error);
    res.status(500).json({ error: error.message });
  }
}

export const eliminarChatController = async (req, res) => {
  const { idChat } = req.params;

  try {
    // 🔹 Validación simple
    if (!idChat) {
      return res.status(400).json({ error: "El idChat es obligatorio" });
    }

    const result = await eliminarChat(idChat);
    return res.status(200).json({
      message: "Chat eliminado correctamente",
      result,
    });
  } catch (error) {
    console.error("Error en eliminarChatController:", error);
    return res.status(500).json({ error: "Error al eliminar el chat" });
  }
};