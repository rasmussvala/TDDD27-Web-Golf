import React from "react";

export function SpectatorRow({ spectators, isAdmin, onClickFunction }) {
  return (
    <>
      {spectators.length !== 0 ? (
        spectators.map((userData, index) => (
          <li key={index}>
            <div>{userData.name}</div>
            <div>
              {isAdmin ? (
                <button
                  onClick={() => {
                    onClickFunction(userData.id);
                  }}
                >
                  Kick
                </button>
              ) : (
                <button id={index}>Kick</button>
              )}
            </div>
          </li>
        ))
      ) : (
        <li>
          <div>-</div>
          <div>-</div>
        </li>
      )}
    </>
  );
}
