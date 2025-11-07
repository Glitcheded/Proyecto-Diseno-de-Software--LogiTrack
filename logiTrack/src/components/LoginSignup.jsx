import React, { useState } from "react";
import "./LoginSignup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const userIco = <FontAwesomeIcon icon={faUser} size="1x" />;
const mailIco = <FontAwesomeIcon icon={faEnvelope} size="1.5x" />;
const lockIco = <FontAwesomeIcon icon={faLock} size="1.5x" />;

// Safe localStorage access
const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "null");
if (usuarioGuardado) {
  console.log("ID:", usuarioGuardado.idUsuario);
  console.log("Nombre:", usuarioGuardado.nombre);
}

export const LoginSignup = () => {
  const [action, setAction] = useState("Inciar Sesión");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent reload
    const baseURL = "http://localhost:3001/api";
    let endpoint = "";
    let payload = {};

    try {
      if (action === "Inciar Sesión") {
        endpoint = "/auth/login";
        payload = { email, password };
      } else if (action === "Crear Cuenta") {
        endpoint = "/auth/signup";
        payload = { nombre, apellidos, email, password };
      }

      const response = await fetch(baseURL + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === "Inciar Sesión") {
          if (data.session?.access_token) {
            localStorage.setItem("supabaseToken", data.session.access_token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
          }
        }

        if (action === "Crear Cuenta") {
          setErrorMsg("Cuenta creada. Por favor, inicia sesión.");
          setAction("Inciar Sesión");
          return;
        }

        navigate("/home");
      } else {
        setErrorMsg(data.error || "Error al procesar la solicitud.");
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      setErrorMsg("Error de conexión con el servidor backend");
    }
  };

  return (
    <div className="container" role="main">
      <header className="login-header">
        <h1>LOGITRACK</h1>
      </header>

      <div className="horizontal-container">
        <div className="login-container">
          <h2 id="auth-heading">
            {action === "Inciar Sesión"
              ? "Bienvenido de vuelta"
              : "Crea tu cuenta"}
          </h2>

          <div className="login-menu-container" aria-labelledby="auth-heading">
            <div
              className="submit-container"
              role="tablist"
              aria-label="Tipo de autenticación"
            >
              <button
                type="button"
                role="tab"
                aria-selected={action === "Inciar Sesión"}
                className={
                  action === "Crear Cuenta" ? "submit-left gray" : "submit-left"
                }
                onClick={() => setAction("Inciar Sesión")}
              >
                Inciar Sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={action === "Crear Cuenta"}
                className={
                  action === "Inciar Sesión"
                    ? "submit-right gray"
                    : "submit-right"
                }
                onClick={() => setAction("Crear Cuenta")}
              >
                Crear Cuenta
              </button>
            </div>

            <p>Ingresa tus datos</p>

            <form
              onSubmit={handleSubmit}
              aria-describedby="form-status"
              noValidate
            >
              <div className="inputs">
                {action === "Crear Cuenta" && (
                  <>
                  <div className="input">
                    <div className="icons" aria-hidden="true">
                      {userIco}
                    </div>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="input">
                    <div className="icons" aria-hidden="true">
                      {userIco}
                    </div>
                    <input
                      id="apellidos"
                      type="text"
                      placeholder="Apellidos"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                  </>
                )}

                <div className="input">
                  <div className="icons" aria-hidden="true">
                    {mailIco}
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="input">
                  <div className="icons" aria-hidden="true">
                    {lockIco}
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={
                      action === "Inciar Sesión"
                        ? "current-password"
                        : "new-password"
                    }
                  />
                </div>
              </div>

              {errorMsg && (
                <div
                  id="form-status"
                  role="alert"
                  aria-live="assertive"
                  className="forgot-password"
                  style={{ color: "red" }}
                >
                  {errorMsg}
                </div>
              )}

              {action === "Inciar Sesión" && (
                <div className="forgot-password">
                  ¿Olvidaste tu contraseña?{" "}
                  <button type="button" className="link-like">
                    Haz clic aquí!
                  </button>
                </div>
              )}

              <button type="submit" className="submit-button">
                <span className="text">{action}</span>
              </button>
            </form>
          </div>
        </div>

        <div
          className="background-image"
          role="presentation"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
};
