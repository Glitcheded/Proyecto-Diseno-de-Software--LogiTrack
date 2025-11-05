import React, { useState, useEffect, useRef } from "react";
import "./Opciones.css";
import { useNavigate } from "react-router-dom";

export const Opciones = ({ userData, userSettings }) => {
  const navigate = useNavigate();

  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuarioGuardado.idUsuario;
  const nombreUsuario = usuarioGuardado.nombre + " " + usuarioGuardado.apellido;
  const usuarioEmail = usuarioGuardado.email;
  const usuarioLinkedIn = usuarioGuardado.enlaceLikedIn || "";
  const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(zonaHoraria);
  const [configuraciones, setConfiguraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const fetchConfiguraciones = async () => {
    const token = localStorage.getItem('supabaseToken');
    try {
      const response = await fetch(`http://localhost:3001/api/config/getConfiguraciones`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

      if (!response.ok) throw new Error("Error al obtener configuraciones");

      const data = await response.json();
      console.log("Configuraciones recibidas:", data);
      return data;
    } catch (error) {
      console.error("Error al cargar configuraciones:", error);
      return null;
    }
  };

  useEffect(() => {
    const obtenerConfiguraciones = async () => {
      try {
        const data = await fetchConfiguraciones(idUsuario);
        if (data) setConfiguraciones(data);
      }
      catch (error) {
        console.error("Error al cargar configuraciones:", error);
      }
      finally {
        setLoading(false);
      }
    };

    obtenerConfiguraciones();
  }, []);

  useEffect(() => {
    if (!configuraciones || configuraciones.length === 0) return;

    setSettings({
      notifsChat: configuraciones[0]?.notifsChat ?? true,
      notifsProyectos: configuraciones[0]?.notifsProyectos ?? true,
      notifsTareas: configuraciones[0]?.notifsTareas ?? true,
      tiempoAlerta: configuraciones[0]?.tiempoAlerta ?? 1,
      conteoSemana: configuraciones[0]?.conteoSemana ?? true,
    });
  }, [configuraciones]);


  console.log(`Config: ${configuraciones[0]?.notifsChat}`);

  const [userInfo, setUserInfo] = useState({
    name: nombreUsuario,
    email: usuarioEmail,
    linkedin: usuarioLinkedIn,
    timezone: zonaHoraria,
    password: "password123",
  });

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");

  const startEditing = (field) => {
    setEditingField(field);
    setTempValue(userInfo[field]);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue("");
  };

  const saveEditing = (field) => {
    setUserInfo((prev) => ({ ...prev, [field]: tempValue }));
    setEditingField(null);
    setTempValue("");
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [passwordInputs, setPasswordInputs] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordRef = useRef(null);

  useEffect(() => {
    if (showPasswordPopup && passwordRef.current) {
      passwordRef.current.focus();
    }
  }, [showPasswordPopup]);

  // En Opciones.jsx

  const handleSaveChanges = async () => {
    const token = localStorage.getItem('supabaseToken'); // Obtenemos el token
    
    // Guarda el perfil
    try {
      const [nombre, ...apellidoPartes] = userInfo.name.split(' ');
      const apellido = apellidoPartes.join(' ');

      const responsePerfil = await fetch('http://localhost:3001/api/config/updateUsuario', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // El backend obtiene el ID del token
          nombre: nombre,
          apellido: apellido,
          enlaceLikedIn: userInfo.linkedin 
        })
      });

      if (!responsePerfil.ok) {
        throw new Error(`Error al guardar el perfil: ${await responsePerfil.text()}`);
      }

      // Actualiza el localStorage con los nuevos datos del perfil
      const usuarioActualizado = await responsePerfil.json();
      const usuarioParaGuardar = {
        ...JSON.parse(localStorage.getItem('usuario')),
        nombre: usuarioActualizado[0].nombre,
        apellido: usuarioActualizado[0].apellido,
        enlaceLikedIn: usuarioActualizado[0].enlaceLikedIn
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioParaGuardar));

    } catch (error) {
      console.error('Error en handleSaveChanges (Perfil):', error);
      alert("Error al guardar los cambios del perfil.");
      return; // Si falla el perfil, no se guardan las configuraciones
    }

    // Guarda configuraciones
    try {
      const configuracionesParaGuardar = {
        notifsChat: settings.notifsChat,
        notifsProyectos: settings.notifsProyectos,
        notifsTareas: settings.notifsTareas,
        tiempoAlerta: settings.tiempoAlerta,
        conteoSemana: settings.conteoSemana
      };

      const responseConfig = await fetch('http://localhost:3001/api/config/updateConfiguraciones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(configuracionesParaGuardar)
      });

      if (!responseConfig.ok) {
        throw new Error(`Error al guardar las configuraciones: ${await responseConfig.text()}`);
      }
      
      // Si todo salió bien
      alert("¡Cambios guardados exitosamente!");

    } catch (error) {
      console.error('Error en handleSaveChanges (Configuraciones):', error);
      alert("Error al guardar las configuraciones de notificación.");
    }
  };

  const handlePasswordChange = () => {
    if (passwordInputs.oldPassword !== userInfo.password) {
      alert("Contraseña antigua incorrecta");
      return;
    }
    if (passwordInputs.newPassword !== passwordInputs.confirmPassword) {
      alert("La nueva contraseña no coincide");
      return;
    }
    setUserInfo((prev) => ({ ...prev, password: passwordInputs.newPassword }));
    setShowPasswordPopup(false);
    alert("Contraseña actualizada");
    setPasswordInputs({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Al eliminar tu cuenta, no podrás recuperar tu información. ¿Deseas continuar?"
      )
    ) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="emptySpace"></div>
      <div
        className="opciones-wrapper"
        role="main"
        aria-label="Configuración del usuario"
      >
        <section className="user-info" aria-labelledby="user-info-title">
          <h2 id="user-info-title">Información del usuario</h2>
          <div tabIndex="0">  
            <label htmlFor="name-input">
              <strong>Nombre:</strong>
            </label>{" "}
            {editingField === "name" ? (
              <>
                <input
                  id="name-input"
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                />
                <button onClick={cancelEditing}>Cancelar</button>
                <button onClick={() => saveEditing("name")}>Guardar</button>
              </>
            ) : (
              <>
                {userInfo.name}{" "}
                <button onClick={() => startEditing("name")}>Editar</button>
              </>
            )}
          </div>

          <div tabIndex="0">
            <strong id="email-label">Email:</strong>{" "}
            <span aria-labelledby="email-label">{userInfo.email}</span>
          </div>


          <div tabIndex="0">
            <label htmlFor="linkedin-input">
              <strong>LikedIn:</strong>
            </label>{" "}
            {editingField === "linkedin" ? (
              <>
                <input
                  id="linkedin-input"
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                />
                <button onClick={cancelEditing}>Cancelar</button>
                <button onClick={() => saveEditing("linkedin")}>Guardar</button>
              </>
            ) : (
              <>
                {userInfo.linkedin}{" "}
                <button onClick={() => startEditing("linkedin")}>Editar</button>
              </>
            )}
          </div>

          <div tabIndex="0">
            <strong>Zona Horaria:</strong> {userInfo.timezone}
          </div>
        </section>

        {/* Notifications Dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="dropdown-button"
            aria-expanded={showNotifications}
            aria-controls="notifications-dropdown"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            Notificaciones
          </button>
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="dropdown-content"
              role="region"
              aria-label="Configuración de notificaciones"
            >
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifsChat}
                  onChange={() =>
                    setSettings((prev) => ({
                      ...prev,
                      notifsChat: !prev.notifsChat,
                    }))
                  }
                />
                Recibir notificaciones de chat
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifsProyectos}
                  onChange={() =>
                    setSettings((prev) => ({
                      ...prev,
                      notifsProyectos: !prev.notifsProyectos,
                    }))
                  }
                />
                Recibir notificaciones de proyectos
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifsTareas}
                  onChange={() =>
                    setSettings((prev) => ({
                      ...prev,
                      notifsTareas: !prev.notifsTareas,
                    }))
                  }
                />
                Recibir notificaciones de tareas
              </label>

              <div className="alert-settings">
                <label htmlFor="alert-days">
                  Días antes de alerta:
                  <input
                    id="alert-days"
                    type="number"
                    min="1"
                    value={settings.tiempoAlerta}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        tiempoAlerta: parseInt(e.target.value),
                      }))
                    }
                  />
                </label>
                <label htmlFor="alert-type">
                  Tipo de conteo:
                  <select
                    id="alert-type"
                    value={settings.conteoSemana ? "Semana/s" : "Dia/s"}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        conteoSemana: e.target.value === "Semana/s",
                      }))
                    }
                  >
                    <option value="Dia/s">Dia/s</option>
                    <option value="Semana/s">Semana/s</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Privacy Dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="dropdown-button"
            aria-expanded={showPrivacy}
            aria-controls="privacy-dropdown"
            onClick={() => setShowPrivacy(!showPrivacy)}
          >
            Privacidad
          </button>
          {showPrivacy && (
            <div
              id="privacy-dropdown"
              className="dropdown-content"
              role="region"
              aria-label="Opciones de privacidad"
            >
              <button onClick={() => setShowPasswordPopup(true)}>
                Cambiar Contraseña
              </button>
              <button onClick={handleDeleteAccount}>Eliminar Cuenta</button>
            </div>
          )}
        </div>

        {/* Password Popup */}
        {showPasswordPopup && (
          <div
            className="password-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="password-popup-title"
          >
            <div className="popup-content">
              <h3 id="password-popup-title">Cambiar Contraseña</h3>
              <label htmlFor="old-password">Contraseña antigua</label>
              <input
                id="old-password"
                type="password"
                ref={passwordRef}
                value={passwordInputs.oldPassword}
                onChange={(e) =>
                  setPasswordInputs((prev) => ({
                    ...prev,
                    oldPassword: e.target.value,
                  }))
                }
              />
              <label htmlFor="new-password">Nueva contraseña</label>
              <input
                id="new-password"
                type="password"
                value={passwordInputs.newPassword}
                onChange={(e) =>
                  setPasswordInputs((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
              <label htmlFor="confirm-password">
                Confirmar nueva contraseña
              </label>
              <input
                id="confirm-password"
                type="password"
                value={passwordInputs.confirmPassword}
                onChange={(e) =>
                  setPasswordInputs((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
              <div className="popup-buttons">
                <button onClick={() => setShowPasswordPopup(false)}>
                  Cancelar
                </button>
                <button onClick={handlePasswordChange}>Aceptar</button>
              </div>
            </div>
          </div>
        )}

        <div className="save-changes">
          <button onClick={handleSaveChanges}>Guardar cambios</button>
        </div>
      </div>
    </>
  );
};
