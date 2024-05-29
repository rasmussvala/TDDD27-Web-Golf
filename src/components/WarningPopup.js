// WarningPopup.js
import React from "react";

const WarningPopup = ({ onClose }) => {
  return (
    <div className="warning-popup">
      <div className="warning-popup-content">
        <p>For the best experience, please use a desktop or larger device.</p>
        <button className="change-username-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WarningPopup;
