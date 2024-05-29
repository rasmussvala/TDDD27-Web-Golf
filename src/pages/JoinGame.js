// Firebase
import { ref, set, get, push, update } from "firebase/database";
import { database, auth } from "../util/firebase.js";

// Componants
import BackButton from "../components/BackButton.js";

// React
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";

export default function JoinGame() {
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [user] = useAuthState(auth);

  // If no active user exist, navigate to sign in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // A function that creates or joins a lobby and updates the db
  const handleJoinLobby = async () => {
    // Check if the lobby code is not empty
    if (
      !lobbyCode.trim() ||
      lobbyCode !== lobbyCode.replace(/[^a-zA-Z0-9]/g, "")
    ) {
      setError("Incorrect lobby code, please enter a valid code!");
      return;
    }

    try {
      // Check if the lobby exists in the database
      const lobbyRef = ref(database, `rooms/${lobbyCode}`);
      const lobbySnapshot = await get(lobbyRef);
      if (!lobbySnapshot.exists()) {
        // Create the lobby in the database
        await set(lobbyRef, {
          playerCount: 1, // First user to join
          lockedLobby: false,
        });
        const playersRef = ref(database, `rooms/${lobbyCode}/players`);
        await push(playersRef, user.uid);
      } else {
        try {
          const lockRef = ref(database, `rooms/${lobbyCode}/lockedLobby`);
          const lockSnapshot = await get(lockRef);
          if (lockSnapshot.val() === true) {
            setError("The lobby is locked!");
            return;
          }
        } catch (e) {
          console.log("Error in lock: ", e, "\nJoining...");
        }

        const playersRef = ref(database, `rooms/${lobbyCode}/players`);
        const playerSnapshot = await get(playersRef);
        const playerCount = Object.keys(playerSnapshot.val()).length;

        if (playerCount < 2) {
          await push(playersRef, user.uid);
          await update(lobbyRef, { playerCount: playerCount + 1 });
        }
      }
    } catch (error) {
      console.error("Error joining lobby:", error);
      setError("Can't join lobby!");
      return;
    }
    navigate(`/Game/${lobbyCode}`);
  };

  // Update LobbyCode to be the same as the input field
  const handleChange = (event) => {
    setLobbyCode(event.target.value);
  };

  return (
    <section className="card-wrapper">
      <section className="card">
        <div className="header-box">
          <BackButton />
          <h1>Join Game</h1>
        </div>
        <section className="box-wrapper">
          <div className="sixty-w-box">
            <div className="input-box">
              <h2>Enter a lobby code</h2>
              <p id="join-text">Join an existing lobby or create a new one.</p>
              <input
                type="text"
                className="input-field"
                value={lobbyCode}
                onChange={handleChange}
                placeholder="Enter lobby code"
              />
              <p id="start-error">{error}</p>

              <div className="enter-button-box">
                <button onClick={handleJoinLobby} className="enter-button">
                  Join
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  );
}
