import React, { useEffect, useState, useRef } from "react";

// Firebase
import { auth, database } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { ref, get, update, onValue } from "firebase/database";

// Util
import { fetchUsername } from "../util/util.js";

// CSS
import "../styles/lobbyoptions.css";

// Components
import { SpectatorRow } from "./SpectatorRow.js";

export default function PopupLobbyOptions({ lobbyCode, admin }) {
  const [user] = useAuthState(auth);
  const contentRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [spectators, setSpectators] = useState([]);

  useEffect(() => {
    if (admin === null || admin.uid === "") {
      return;
    }
    if (user.uid === admin.uid) {
      setIsAdmin(true);
      contentRef.current.classList.remove("is-not-admin");
      contentRef.current.classList.add("is-admin");
    } else {
      setIsAdmin(false);
      contentRef.current.classList.remove("is-admin");
      contentRef.current.classList.add("is-not-admin");
    }
  }, [admin]);

  useEffect(() => {
    async function getData() {
      try {
        const userStatusRef = ref(database, `rooms/${lobbyCode}/user-status`);
        const snapshot = await get(userStatusRef);
        let newPlayers = [];
        let newSpectators = [];

        const promises = [];

        snapshot.forEach((childSnapshot) => {
          const fetchData = async () => {
            const id = childSnapshot.key;
            const data = childSnapshot.val();
            const name = await fetchUsername(id);
            const userData = { id, name };

            if (data.type === "players") {
              newPlayers.push(userData);
            } else {
              newSpectators.push(userData);
            }
          };

          promises.push(fetchData());
        });

        await Promise.all(promises);

        // Sort newPlayers so that the admin player is first
        newPlayers.sort((a, b) => {
          if (isAdmin && a.id === user.uid) return 1;
          else return -1;
        });

        setPlayers(newPlayers);
        setSpectators(newSpectators);
      } catch (e) {
        console.log("Get data error:", e);
      }
    }

    const userStatusRef = ref(database, `rooms/${lobbyCode}/user-status`);
    const unsubscribe = onValue(userStatusRef, () => {
      getData();
    });

    return () => unsubscribe();
  }, [lobbyCode]);

  const kickUser = async (theUserID) => {
    try {
      const userStatusRef = ref(database, `rooms/${lobbyCode}/user-status`);
      const snapshot = await get(userStatusRef);

      snapshot.forEach((childSnapshot) => {
        const userId = childSnapshot.key;
        const userData = childSnapshot.val();
        if (theUserID === userId && userData.type === "spectators") {
          try {
            const userRef = ref(
              database,
              `rooms/${lobbyCode}/user-status/${userId}`
            );
            update(userRef, { inLobby: false });
            return;
          } catch (e) {
            console.log("UserRef error:", e);
          }
        }
      });
    } catch (e) {
      console.log("Status error:", e);
    }
  };

  return (
    <section className="lobby-options-wrapper" ref={contentRef}>
      <div className="lobby-options-admin">
        <div>Admin: </div>
        {admin.name}
      </div>
      <div className="lobby-options-lobby">
        <div>Lobby: </div>
        {lobbyCode}
      </div>
      <section className="current-users-board-wrapper">
        <h2>Players</h2>
        <ul>
          <li className="current-users-board-headers">
            <div>Name</div>
            <div>Player</div>
          </li>
          {players.length !== 0 ? (
            players.map((userData, index) => (
              <li key={index}>
                <div> {userData.name}</div>
                <div id={`current-users-board-player${index + 1}`}>
                  Player {index + 1}
                </div>
              </li>
            ))
          ) : (
            <li>
              <div>-</div>
              <div>-</div>
            </li>
          )}
        </ul>
        <h2>Spectators</h2>
        <ul>
          <li className="current-users-board-headers">
            <div>Name</div>
            <div>Options</div>
          </li>
          <SpectatorRow
            spectators={spectators}
            isAdmin={isAdmin}
            onClickFunction={kickUser}
          />
        </ul>
      </section>
    </section>
  );
}
