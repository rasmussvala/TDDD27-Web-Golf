import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { database, auth } from "../util/firebase.js";
import { ref, onValue, update, push, get } from "firebase/database";
import Loading from "../components/Loading.js";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";

import "../styles/findgame.css";

export default function FindGame() {
  const [showLoading, setShowLoading] = useState(true);
  const [loobyName, setLoobyName] = useState("");

  const [joiningCounter, setJoiningCounter] = useState("");
  const [joiningCounterStyle, setJoiningCounterStyle] = useState("countdown");

  const roomsRef = ref(database, "rooms");
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  // Function that handles joining a lobby, it also updates the db correctly
  const handleJoinLobby = async (lobbyCode) => {
    try {
      // Check if the lobby exists in the database
      const lobbyRef = ref(database, `rooms/${lobbyCode}`);

      const playersRef = ref(database, `rooms/${lobbyCode}/players`);
      const playerSnapshot = await get(playersRef);
      const playerCount = Object.keys(playerSnapshot.val()).length;

      if (playerCount < 2) {
        await push(playersRef, user.uid);
        await update(lobbyRef, { playerCount: playerCount + 1 });
      }
      navigate(`/Game/${lobbyCode}`);
      return;
    } catch (error) {
      console.log("Error joining lobby:", error);
    }
  };

  // This useEffects triggers when the a lobby is found and the joiningCounter starts to count down
  useEffect(() => {
    setJoiningCounterStyle("countdown"); // Trigger animation
    const timeout = setTimeout(() => {
      setJoiningCounterStyle(""); // Reset animation after 0.2s
    }, 200);
    return () => clearTimeout(timeout); // Clean up timeout
  }, [joiningCounter]);

  // Function that updates the count down once a lobby is found
  async function countDown(start, timeOut, setLet) {
    setLet("");

    for (let i = start; i >= 1; i--) {
      setLet(i.toString());

      await new Promise((resolve) => {
        setTimeout(async () => {
          resolve();
        }, timeOut);
      });
    }
    return;
  }

  // This useEffect initializes a listener for any available lobby and chooses a random available lobby
  useEffect(() => {
    const unsubscribe = onValue(roomsRef, async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const roomsData = snapshot.val();
          const roomKeys = Object.keys(roomsData);

          let counter = 0;
          while (counter < roomKeys.length) {
            const randomLobbyIndex = Math.floor(
              Math.random() * roomKeys.length
            );
            const randomRoomKey = roomKeys[randomLobbyIndex];
            const randomRoom = roomsData[randomRoomKey];

            if (randomRoom && randomRoom.playerCount === 1) {
              try {
                const lockRef = ref(
                  database,
                  `rooms/${randomRoomKey}/lockedLobby`
                );
                const lockSnapshot = await get(lockRef);
                if (lockSnapshot.val() === false) {
                  const lobbyCode = randomRoomKey;
                  setLoobyName(lobbyCode);
                  setShowLoading(false);

                  await countDown(3, 1000, setJoiningCounter);

                  unsubscribe();
                  await handleJoinLobby(lobbyCode);
                  return;
                }
              } catch (e) {
                console.log("Error in lock: ", e);
              }
            }
            counter++;
          }
        } else {
          console.log("No rooms found.");
        }
      } catch (error) {
        console.log("Error while processing room data:", error);
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <section className="card-wrapper">
      <section className="card">
        <div className="header-box">
          <BackButton />
          <h1>Find Game</h1>
        </div>
        <div className="loading-wrapper">
          <div className="loading-card">
            <div className="loading-content-wrapper">
              {showLoading ? (
                <div className="loading-content">
                  <h2>Finding Available Game</h2>
                  <Loading scale={3} color={"var(--mild-dark-blue)"} />
                </div>
              ) : (
                <div className="loading-content">
                  <h2>Joining lobby: {loobyName}</h2>
                  <h1 className={joiningCounterStyle}>{joiningCounter}</h1>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
