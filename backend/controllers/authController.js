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

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data?.user;
    if (!user) {
      return res.status(400).json({ error: "No se pudo obtener el usuario" });
    }

    const { data: usuarios, error: localError } = await supabase
      .from("Usuario")
      .select("idUsuario, email")
      .ilike("email", email);

    if (localError) {
      console.error("[auth] Error buscando usuario local:", localError);
      return res.status(500).json({ error: localError.message });
    }

    if (!usuarios || usuarios.length === 0) {
      console.log("[auth] Usuario no existe en DB local. Creando...");

      const { data: newUser, error: insertError } = await supabase
        .from("Usuario")
        .insert([
          {
            email,
            nombre: user.user_metadata?.name || null,
            apellido: user.user_metadata?.apellido || null,
          },
        ])
        .select("idUsuario, email")
        .single();

      if (insertError) {
        console.error("[auth] Error creando usuario local:", insertError);
        return res.status(500).json({ error: insertError.message });
      }

      console.log("[auth] Usuario local creado:", newUser);
    } else {
      console.log("[auth] Usuario ya existe en DB local:", usuarios[0].email);
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("[auth] Error interno en login:", err);
    res.status(500).json({ error: err.message });
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
            .select('idUsuario, nombre, apellido, email, "enlaceLikedIn"')
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