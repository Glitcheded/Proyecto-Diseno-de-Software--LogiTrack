import React, { useState } from "react";
import "./Opciones.css";
import { useNavigate } from "react-router-dom";

export const Opciones = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    linkedin: "https://www.linkedin.com/in/johndoe",
    timezone: "GMT-6",
    password: "password123",
  });

  const [settings, setSettings] = useState({
    notifsChat: true,
    notifsProyectos: true,
    notifsTareas: true,
    tiempoAlerta: 1,
    conteoSemana: true,
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

  const handleSaveChanges = () => {
    console.log("Saved user info:", userInfo);
    console.log("Saved settings:", settings);
    alert("Cambios guardados exitosamente");
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
    <div className="opciones-wrapper">
      <div className="user-info">
        <div>
          <strong>Nombre:</strong>{" "}
          {editingField === "name" ? (
            <>
              <input
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

        <div>
          <strong>Email:</strong> {userInfo.email}
        </div>

        <div>
          <strong>LinkedIn:</strong>{" "}
          {editingField === "linkedin" ? (
            <>
              <input
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

        <div>
          <strong>Zona Horaria:</strong> {userInfo.timezone}
        </div>
      </div>

      <div className="dropdown-wrapper">
        <button
          className="dropdown-button"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          Notifications
        </button>
        {showNotifications && (
          <div className="dropdown-content">
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
              <label>
                Configura cuántos días antes deseas recibir alertas de
                vencimiento:
                <input
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
              <label>
                <select
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

      <div className="dropdown-wrapper">
        <button
          className="dropdown-button"
          onClick={() => setShowPrivacy(!showPrivacy)}
        >
          Privacidad
        </button>
        {showPrivacy && (
          <div className="dropdown-content">
            <button onClick={() => setShowPasswordPopup(true)}>
              Cambiar Contraseña
            </button>
            <button onClick={handleDeleteAccount}>Eliminar Cuenta</button>
          </div>
        )}
      </div>

      {showPasswordPopup && (
        <div className="password-popup">
          <div className="popup-content">
            <h3>Cambiar Contraseña</h3>
            <input
              type="password"
              placeholder="Contraseña antigua"
              value={passwordInputs.oldPassword}
              onChange={(e) =>
                setPasswordInputs((prev) => ({
                  ...prev,
                  oldPassword: e.target.value,
                }))
              }
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={passwordInputs.newPassword}
              onChange={(e) =>
                setPasswordInputs((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
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
  );
};
