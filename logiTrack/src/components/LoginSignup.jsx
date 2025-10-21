import React, { useState } from "react";
import "./LoginSignup.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const userIco = <FontAwesomeIcon icon={faUser} size="2x" />;
const mailIco = <FontAwesomeIcon icon={faEnvelope} size="2x" />;
const lockIco = <FontAwesomeIcon icon={faLock} size="2x" />;

export const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action === "Login" ? (
          <div></div>
        ) : (
          <div className="input">
            <div className="icons">{userIco}</div>
            <input type="text" placeholder="Nombre" />
          </div>
        )}
        <div className="input">
          <div className="icons">{mailIco}</div>
          <input type="email" placeholder="ejemplo@gmail.com" />
        </div>
        <div className="input">
          <div className="icons">{lockIco}</div>
          <input type="password" placeholder="Contraseña" />
        </div>
      </div>
      {action === "Login" ? (
        <div></div>
      ) : (
        <div className="forgot-password">
          Lost Password? <span>Click Here!</span>
        </div>
      )}
      <div className="submit-container">
        <div
          className={action === "Login" ? "submit gray" : "submit"}
          onClick={() => {
            setAction("Sign Up");
          }}
        >
          Sign Up
        </div>
        <div
          className={action === "Sign Up" ? "submit gray" : "submit"}
          onClick={() => {
            setAction("Login");
          }}
        >
          Login
        </div>
      </div>
    </div>
  );
};
