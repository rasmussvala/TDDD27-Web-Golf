import React from "react";

export default function Message({ message }) {
  function formatTimeFromTimeStamp(timestamp) {
    const date = new Date(timestamp);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return hours + ":" + minutes;
  }

  return (
    <div className="chat-messege">
      <div
        className="chat-icon"
        style={{ backgroundImage: `url(${message.icon})` }}
      ></div>
      <div className="chat-messege-content">
        <div className="chat-messege-name-box">
          <p className="chat-messege-name">{message.sender}</p>
          <p className="chat-messege-date">
            {formatTimeFromTimeStamp(message.timestamp)}
          </p>
        </div>
        <p className="chat-messege-text">{message.text}</p>
      </div>
    </div>
  );
}
