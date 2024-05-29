import { useContext } from "react";
import AnimeContext from "../util/AnimationContext.js";

// CSS
import "../styles/animationswitchbutton.css";

export default function AnimationSwitchButton() {
  const { animeBool, setAnimeBool } = useContext(AnimeContext);

  const toggleAnimation = () => {
    setAnimeBool((prev) => !prev);
  };

  const buttonStyleON = {
    color: "var(--golf-green)",
  };

  const buttonStyleOff = {
    color: "var(--mild-red)",
  };

  return (
    <section className="animation-switch">
      <button
        onClick={toggleAnimation}
        style={animeBool ? buttonStyleON : buttonStyleOff}
      >
        {animeBool ? "Animation On" : "Animation Off"}
      </button>
    </section>
  );
}
