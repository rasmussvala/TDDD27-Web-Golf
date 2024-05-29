import React from "react";

export default function AddFriendLogo() {
  const logoStyle = {
    width: "2.4rem",
    height: "2.4rem",
    backgroundColor: "none",
  };

  return (
    <svg
      fill="var(--mild-blue)"
      viewBox="0 0 55 55"
      style={logoStyle}
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="27" cy="27.5" r="27" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50.6447 40.546C52.7829 36.6789 54 32.2316 54 27.5C54 12.5883 41.9117 0.5 27 0.5C12.0883 0.5 0 12.5883 0 27.5C0 32.3028 1.25401 36.8127 3.45247 40.7202L4.33929 40.2768L16.4725 35.1023C18.3987 34.2808 18.7513 31.701 17.1161 30.3928C14.9897 28.2665 13.9797 25.2682 14.386 22.2886L14.7037 19.9589C15.3952 14.8878 19.7264 11.1071 24.8444 11.1071C29.9503 11.1071 34.2751 14.8704 34.9807 19.9273L35.1964 21.4732V25.1798C35.1964 25.9165 35.0586 26.6468 34.7902 27.3328L34.366 28.4167C33.5871 30.4072 34.3203 32.6708 36.1183 33.8267C36.307 33.948 36.5046 34.055 36.7093 34.1468L50.3839 40.2768C50.4843 40.3571 50.5713 40.4477 50.6447 40.546Z"
        fill="var(--mild-dark-blue)"
      />
      <path
        d="M12 26V35M12 35H21M12 35V44M12 35H3"
        stroke="var(--mild-dark-blue)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M12 26V35M12 35H21M12 35V44M12 35H3"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
