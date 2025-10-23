import React from "react";
import "./NavBar.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";

import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";

const userIco = <FontAwesomeIcon icon={faUser} size="2x" />;
const addFriendIco = <FontAwesomeIcon icon={faUserPlus} size="2x" />;
const optionsIco = <FontAwesomeIcon icon={faGear} size="2x" />;

const clipboardIco = <FontAwesomeIcon icon={faClipboardList} size="2x" />;
const calendarIco = <FontAwesomeIcon icon={faCalendar} size="2x" />;
const messageIco = <FontAwesomeIcon icon={faMessage} size="2x" />;
const envelopeIco = <FontAwesomeIcon icon={faEnvelope} size="2x" />;
const fileIco = <FontAwesomeIcon icon={faFile} size="2x" />;
const previousIco = <FontAwesomeIcon icon={faClockRotateLeft} size="2x" />;

export const NavBar = () => {
  return (
    <div className="NV-container">
      <div className="options-container">
        <div className="user-icon">
          <div className="icons">{userIco}</div>
          Usuario
        </div>
        <div className="options-others">
          <div className="icons">{addFriendIco}</div>
          <div className="icons">{optionsIco}</div>
        </div>
      </div>
      <div className="navbar-container">
        <div className="navbar-element">
          <div className="icons">{clipboardIco}</div>
          Mis Tareas
        </div>
        <div className="navbar-element">
          <div className="icons">{calendarIco}</div>
          Calendario
        </div>
        <div className="navbar-element">
          <div className="icons">{messageIco}</div>
          Chat
        </div>
        <div className="navbar-element">
          <div className="icons">{envelopeIco}</div>
          Notificaciones
        </div>
        <div className="navbar-element">
          <div className="icons">{fileIco}</div>
          Mis Proyectos
        </div>
        <div className="navbar-element">
          <div className="icons">{previousIco}</div>
          Proyectos Anteriores
        </div>
      </div>
    </div>
  );
};
