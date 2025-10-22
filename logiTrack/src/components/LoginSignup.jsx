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

  // ----------- MAIN HANDLER ------------
  const handleSubmit = async () => {
    // === REAL BACKEND CODE (to be implemented later) ===
    /*
    try {
      if (action === "Inciar Sesión") {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          navigate("/home"); // successful login
        } else {
          alert("Credenciales incorrectas");
        }

      } else if (action === "Crear Cuenta") {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          navigate("/home"); // successful signup
        } else {
          alert("Error al crear la cuenta");
        }
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      alert("Error de conexión con el servidor");
    }
    */

    navigate("/home");
  };

  return (
    <div className="container">
      <header>
        <h1>LOGITRACK</h1>
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
        </div>
        <div className="background-image"></div>
      </div>
    </div>
  );
};
