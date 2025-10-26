import { nuevoChat } from '../models/chatModel.js';

export async function crearChat(req, res) {
  try {
    const { esGrupo, nombreChat } = req.body;
    const data = await nuevoChat({ esGrupo, nombreChat });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
