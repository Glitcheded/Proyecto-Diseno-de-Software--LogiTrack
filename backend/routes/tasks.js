import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/mis-tareas', async (req, res) => {
    
    try {
        // Obtener el token del header
        const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"
        if (!token) {
            return res.status(401).json({ error: 'No autorizado: Sin token' });
        }

        // Verificar el token y obtener el usuario
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'No autorizado: Token inválido' });
        }

        // Traducir el email de Auth al idUsuario
        const { data: usuarioLocal, error: localError } = await supabase
            .from('Usuario')
            .select('idUsuario')
            .eq('email', user.email) // Usamos el email como puente
            .single();

        if (localError || !usuarioLocal) {
            return res.status(404).json({ error: "Usuario de Auth no encontrado en tabla 'Usuario'" });
        }

        // Usamos el ID para la consulta
        const idUsuarioLogueado = usuarioLocal.idUsuario;

        const { data, error } = await supabase
            .from('UsuarioPorTarea')
            .select(`
                Tarea (
                    idTarea,
                    nombre,
                    fechaEntrega,
                    idTareaMadre,
                    Proyecto ( nombre ),
                    EstadoTarea ( nombre ),
                    Prioridad ( nivel ),
                    Comentario ( 
                        comentario,
                        Usuario ( nombre, apellido )
                    ),
                    UsuarioPorTarea (
                        Usuario ( nombre, apellido )
                    )
                )
            `)
            .eq('idUsuario', idUsuarioLogueado)
            .neq('Tarea(EstadoTarea.nombre)', 'Terminado');

        if (error) throw error;

        // Transformar los datos a planos
        const tareasFormateadas = data
            .filter(item => item.Tarea)
            .map(item => {
                const tarea = item.Tarea;
                
                return {
                    id: tarea.idTarea,
                    name: tarea.nombre,
                    project: tarea.Proyecto?.nombre || 'Sin Proyecto',
                    state: tarea.EstadoTarea?.nombre || 'Sin Estado',
                    prioridad: tarea.Prioridad?.nivel || 'Sin Prioridad',
                    dueDate: tarea.fechaEntrega,
                    members: tarea.UsuarioPorTarea.map(upt => 
                        `${upt.Usuario.nombre} ${upt.Usuario.apellido}`.trim()
                    ),
                    comments: tarea.Comentario.map(c => ({
                        author: `${c.Usuario.nombre} ${c.Usuario.apellido}`.trim(),
                        text: c.comentario
                    })),
                    subtaskOf: tarea.idTareaMadre
                };
            });

        res.status(200).json(tareasFormateadas);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;