import React from "react";
import "./NavBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

const userIco = <FontAwesomeIcon icon={faUser} size="1x" />;

export const NavBar = () => {
  return (
    <div className="container">
      <div className="options-container">
        <div className="user-icon">
          <div className="icons">{userIco}</div>
          Usuario
        </div>
      </div>
      <div className="navbar-container"></div>
    </div>
  );
};
