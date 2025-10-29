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

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json(data);
};