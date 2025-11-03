import React from "react";
import "./ChatHeader.css";

export const ChatHeader = ({ chatName }) => {
  return (
    <div className="chat-header">
      <h2 className="chat-title">{chatName}</h2>
    </div>
  );
};

