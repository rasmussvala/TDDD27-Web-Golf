import React from "react";
import "../styles/loading.css";

const Loading = ({ scale = 1, color = "#000000" }) => {
  const svgStyle = {
    transform: `scale(${scale})`,
  };

  const circleStyle = {
    fill: color,
  };

  return (
    <svg
      style={svgStyle}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="spinner"
    >
      <circle
        style={circleStyle}
        className="spinner_nOfF"
        cx="4"
        cy="12"
        r="3"
      />
      <circle
        style={circleStyle}
        className="spinner_nOfF spinner_fVhf"
        cx="4"
        cy="12"
        r="3"
      />
      <circle
        style={circleStyle}
        className="spinner_nOfF spinner_piVe"
        cx="4"
        cy="12"
        r="3"
      />
      <circle
        style={circleStyle}
        className="spinner_nOfF spinner_MSNs"
        cx="4"
        cy="12"
        r="3"
      />
    </svg>
  );
};

export default Loading;
