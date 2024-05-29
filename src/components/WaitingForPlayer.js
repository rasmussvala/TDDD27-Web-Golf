import React from "react";
import Loading from "./Loading.js";
import "../styles/waiting.css";

export default function WaitingForPlayer({
  Player1 = { name: "-" },
  Player2 = { name: "-" },
  starting = false,
}) {
  return (
    <section className={"loading-style"}>
      <div className={"wrapper"}>
        <div className={"loading-header"}>
          <div className={"loading-header-block"}>
            <h2 className={"waiting-text"}>Waiting for player to join</h2>
            <Loading scale={2} color={"var(--mild-dark-blue)"} />
          </div>
        </div>
        <div className={"types-div"}>
          <p className={"player-p"}>Player 1</p>
          <p className={"player-p"}>Player 2</p>
        </div>
        <div className={"players-div"}>
          <p className={"player-p"}>{Player1.name ? Player1.name : "-"}</p>
          <p className={"player-p"}>{Player2.name ? Player2.name : "-"}</p>
        </div>
        {starting ? (
          <p className="starting-game-animation">Starting game...</p>
        ) : (
          <p style={{ opacity: 0 }} className="starting-game">
            -
          </p>
        )}
      </div>
    </section>
  );
}
