import React, { useState } from "react";
import "./LoginSignup.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const userIco = <FontAwesomeIcon icon={faUser} size="1x" />;
const mailIco = <FontAwesomeIcon icon={faEnvelope} size="1.5x" />;
const lockIco = <FontAwesomeIcon icon={faLock} size="1.5x" />;
import { useNavigate } from "react-router-dom"; // for navigation (React Router)

export const LoginSignup = () => {
  const [action, setAction] = useState("Inciar Sesión");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Se cambió, falta probar***
    const baseURL = "http://localhost:3001/api"; // URL del backend
    let endpoint = "";
    let payload = {};

    try {
      if (action === "Inciar Sesión") {
        endpoint = "/auth/login";
        payload = { email, password };
      } else if (action === "Crear Cuenta") {
        endpoint = "/auth/signup";
        payload = { name, email, password }; // 'name' es el estado que él ya tiene
      }

      const response = await fetch(baseURL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === "Inciar Sesión") {
          
          // Guarda el token
          if (data.session.access_token) {
            localStorage.setItem('supabaseToken', data.session.access_token);
          }

          // Guarda la info del usuario
          if (data.user) {
            localStorage.setItem('usuario', JSON.stringify(data.user));
          }
        }

        if (action === "Crear Cuenta") {
          alert("Cuenta creada. Por favor, inicia sesión.");
          setAction("Inciar Sesión"); // Lo regresa al login
          return;
        }

        navigate("/home"); // Navegación exitosa
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      alert("Error de conexión con el servidor backend");
    }
  };

  return (
    <div className="container">
      <header>
        <div className="login-header">
          <h1>LOGITRACK</h1>
        </div>
      </header>
      <div className="horizontal-container">
        <div className="login-container">
          <h2>Bienvenido de vuelta</h2>
          <div className="login-menu-container">
            <div className="submit-container">
              <div
                className={
                  action === "Crear Cuenta" ? "submit-left gray" : "submit-left"
                }
                onClick={() => {
                  setAction("Inciar Sesión");
                }}
              >
                Inciar Sesión
              </div>
              <div
                className={
                  action === "Inciar Sesión"
                    ? "submit-right gray"
                    : "submit-right"
                }
                onClick={() => {
                  setAction("Crear Cuenta");
                }}
              >
                Crear Cuenta
              </div>
            </div>
            <p>Ingresa tus datos</p>
            <div className="inputs">
              {action === "Inciar Sesión" ? null : (
                <div className="input">
                  <div className="icons">{userIco}</div>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="input">
                <div className="icons">{mailIco}</div>
                <input
                  type="email"
                  placeholder="ejemplo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input">
                <div className="icons">{lockIco}</div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {action === "Crear Cuenta" ? (
              <div></div>
            ) : (
              <div className="forgot-password">
                Olvidaste tu contraseña? <span>Click aquí!</span>
              </div>
            )}
            <div className="submit-button" onClick={handleSubmit}>
              <div className="text">{action}</div>
            </div>
          </div>
          {/* Quitar este después */}
          <div className="tempLogin" onClick={() => navigate("/home")}>
            Temp Login
          </div>
        </div>
        <div className="background-image"></div>
      </div>
    </div>
  );
};
