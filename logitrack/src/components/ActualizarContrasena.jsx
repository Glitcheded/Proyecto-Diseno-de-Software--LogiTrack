import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ActualizarContrasena.css"; // Importa el nuevo CSS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const lockIco = <FontAwesomeIcon icon={faLock} size="1.5x" />;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const cleanedBase = API_BASE_URL ? API_BASE_URL.replace(/\/$/, '') : '';
const baseURL = `${cleanedBase}/api`;


export const ActualizarContrasena = () => {
  const [token, setToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Extrae el token de la URL al cargar la página
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      setToken(accessToken);
    } else {
      const queryToken = new URLSearchParams(window.location.search).get("token");
      if (queryToken) {
        setToken(queryToken);
      } else {
        setError(
          "Token no válido o enlace expirado. Por favor, solicita un nuevo correo."
        );
      }
    }
  }, []);

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== verifyPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      setError("Token no encontrado. No se puede actualizar.");
      return;
    }

    // Llama al endpoint del backend para actualizar
    try {
      const url = baseURL + "/auth/update-password";
      console.log("Intentando conectar con:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, newPassword: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("¡Contraseña actualizada! Redirigiendo al login...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(data.error || "Error al actualizar la contraseña.");
      }
    } catch (err) {
      console.error("Error de conexión/red/CORS:", err); 
      setError("Error de conexión con el servidor. (Verifica consola por error de CORS)");
    }
  };

  return (
    <div className="container">
      <header className="login-header">
        <h1>LOGITRACK</h1>
      </header>

      <div className="horizontal-container">
        <div className="login-container">
          
          <h2>Actualizar Contraseña</h2>

          <form className="login-menu-container" onSubmit={handleSubmit}>
            <p>Ingresa tu nueva contraseña</p>

            <div className="inputs">
              <div className="input">
                <div className="icons" aria-hidden="true">
                  {lockIco}
                </div>
                <input
                  type="password"
                  placeholder="Nueva Contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input">
                <div className="icons" aria-hidden="true">
                  {lockIco}
                </div>
                <input
                  type="password"
                  placeholder="Verificar Contraseña"
                  value={verifyPassword}
                  onChange={(e) => setVerifyPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mensajes de éxito o error */}
            {message && (
              <div className="form-message success">{message}</div>
            )}
            {error && (
              <div className="form-message error">{error}</div>
            )}

            <button type="submit" className="submit-button">
              Guardar Contraseña
            </button>
          </form>
        </div>

        {/* Mantenemos la misma imagen de fondo */}
        <div
          className="background-image"
          role="presentation"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
};