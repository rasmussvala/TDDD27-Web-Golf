// React
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

// Pages
import Menu from "./Menu.js";
import SignIn from "./SignIn";
import Game from "./Game";
import JoinGame from "./JoinGame.js";
import Global from "./Global.js";
import FindGame from "./FindGame.js";
import Statistics from "./Statistics.js";

// Componant
import WarningPopup from "../components/WarningPopup.js";

export default function App() {
  const [isWarningVisible, setWarningVisible] = useState(false);

  // Warn the user it has a narrow screen
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setWarningVisible(true);
      else setWarningVisible(false);
    };

    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isWarningVisible && (
        <WarningPopup onClose={() => setWarningVisible(false)} />
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<SignIn />} />
            <Route path="Menu" element={<Menu />} />
            <Route path="Game/:lobbyCode" element={<Game />} />
            <Route path="JoinGame" element={<JoinGame />} />
            <Route path="FindGame" element={<FindGame />} />
            <Route path="Global" element={<Global />} />
            <Route path="Statistics" element={<Statistics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
