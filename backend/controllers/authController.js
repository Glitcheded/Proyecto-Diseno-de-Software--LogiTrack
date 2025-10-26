import { supabase } from '../supabaseClient.js';
import { crearUsuarioLocal, crearConfiguracionDefault } from '../models/authModel.js';

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  const [nombre, apellido] = name.split(' ');

  try {
    // Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (authData.user) {
      // Insertar usuario en tabla "Usuario"
      const nuevoUsuario = await crearUsuarioLocal(nombre, apellido, email);

      // Insertar en tabla "ConfiguracionUsuario"
      await crearConfiguracionDefault(nuevoUsuario.idUsuario);

      res.status(201).json(authData);
    }
  } catch (error) {
    if (authData?.user?.id) {
      await supabase.auth.admin.deleteUser(authData.user.id);
    }
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