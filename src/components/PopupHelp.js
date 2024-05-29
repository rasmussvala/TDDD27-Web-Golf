import React from "react";

export default function PopupHelp() {
  // CSS
  const wrapper = {
    width: "100%",
    height: "100%",
    overflow: "auto",
  };

  const content = {
    width: "100%",
    height: "95%",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const marginUnit = "0.5vh";

  const leftContent = {
    width: `calc(50% - ${marginUnit})`,
    height: `calc(100% - ${marginUnit})`,
    margin: `${marginUnit}`,
    marginRight: `calc(${marginUnit}/2)`,

    borderRadius: "var(--small-border-radius)",
    backgroundColor: "var(--white)",
  };

  const rightContent = {
    width: `calc(50% - ${marginUnit})`,
    height: `calc(100% - ${marginUnit})`,
    margin: `${marginUnit}`,
    marginLeft: `calc(${marginUnit}/2)`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    borderRadius: "var(--small-border-radius)",
    backgroundColor: "var(--white)",
  };

  const header = {
    width: "calc(100% - 2rem)",
    textAlign: "center",
    margin: "1rem",
    fontSize: "1.8rem",
    color: "var(--mild-blue)",
    fontWeight: "bold",
  };

  const p = {
    width: "calc(100% - 2rem)",
    margin: "1rem",
    fontSize: "1.4rem",
    color: "var(--gray)",
  };

  return (
    <section style={wrapper}>
      <div style={content}>
        <div style={leftContent}>
          <p style={header}>How to play</p>
          <p style={p}>
            To change the direction of your shot, use the left and right arrow
            key. <br /> <br />
            When your lineup is completed, use the up and down arrow key to
            choose the amount of force when hitting the ball. <br /> <br />
            Lastly, use the spacebar key to take the shot.
          </p>
        </div>
        <div style={rightContent}>
          <div id="help-controls"></div>
        </div>
      </div>
      <div style={content}>
        <div style={leftContent}>
          <p style={header}>How to win</p>

          <p style={p}>
            The aim of the game is to be the first player to reach the hole in
            the end of the golf track. <br /> <br />
            Both players take turns taking their shots. <br /> <br /> <br />
            May the best player win!
          </p>
        </div>
        <div style={rightContent}>
          <div id="help-goal"></div>
        </div>
      </div>
    </section>
  );
}
