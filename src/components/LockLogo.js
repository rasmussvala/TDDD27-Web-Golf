import React from "react";

export default function LockLogo({ isLocked, canClick }) {
  const logoStyle = {
    width: "2.4rem",
    height: "2.4rem",
    backgroundColor: "none",
    fill: "var(--white)",
  };

  return (
    <section style={logoStyle} className={canClick ? "can-click-lock" : ""}>
      {isLocked ? (
        <svg viewBox="0 0 24 24">
          <path d="M6 8v-2c0-3.313 2.686-6 6-6 3.312 0 6 2.687 6 6v2h-2v-2c0-2.206-1.795-4-4-4s-4 1.794-4 4v2h-2zm15 2v14h-18v-14h18zm-2 2h-14v10h14v-10z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24">
          <path d="M12 10v-4c0-3.313-2.687-6-6-6s-6 2.687-6 6v3h2v-3c0-2.206 1.794-4 4-4s4 1.794 4 4v4h-4v14h18v-14h-12zm10 12h-14v-10h14v10z" />
        </svg>
      )}
    </section>
  );
}
