import { supabase } from '../supabaseClient.js';
import { crearUsuarioLocal, crearConfiguracionDefault } from '../models/authModel.js';

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const [nombre, apellido] = name.split(' ');

  let authData = null; 

  try {
    const { data, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    authData = data;

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authData.user) {
      // Inserta usuario en tabla "Usuario"
      const nuevoUsuario = await crearUsuarioLocal(nombre, apellido, email);

      // Inserta en tabla "ConfiguracionUsuario"
      await crearConfiguracionDefault(nuevoUsuario.idUsuario);

      res.status(201).json(authData);
    } else {
      // Por si acaso authData.user es nulo pero no hubo error
      return res.status(400).json({ error: "No se pudo crear el usuario en Supabase Auth" });
    }

  } catch (error) {
    if (authData?.user?.id) {
      // Intenta borrar el usuario de Auth si la inserción local falló
      await supabase.auth.admin.deleteUser(authData.user.id);
    }
    // Envía el mensaje de error
    res.status(500).json({ error: error.message });
  }
};

export const logIn = async (req, res) => {
  const { email, password } = req.body;

  //Autenticar al usuario con Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Si el login fue exitoso, busca los datos de la tabla Usuario
  try {
    const { data: usuarioLocal, error: localError } = await supabase
      .from('Usuario')
      .select('idUsuario, nombre, apellido, email, enlaceLikedIn') 
      .eq('email', data.user.email)
      .single();

    if (localError || !usuarioLocal) {
      return res.status(404).json({ error: "Perfil de usuario no encontrado en la tabla local" });
    }

    // Enviar ambas cosas al frontend: la sesión (token) y el perfil (usuarioLocal)
    res.status(200).json({ 
      session: data.session,
      usuario: usuarioLocal  
    });

  } catch (error) {
    res.status(500).json({ error: "Error al buscar el perfil de usuario local", details: error.message });
  }
};

export const logOut = async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    
    res.status(200).json({ message: "Sesión cerrada exitosamente" });
};

//Obtiene la información del usuario actual basado en el token (Middleware checkAuth)
export const getUserInfo = async (req, res) => {
    try {
        const idUsuario = req.idUsuario;
        
        const { data, error } = await supabase
            .from('Usuario')
            .select('idUsuario, nombre, apellido, email, enlaceLikedIn')
            .eq('idUsuario', idUsuario)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};