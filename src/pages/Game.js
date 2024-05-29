// React
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Firebase
import { auth, database } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  ref,
  onValue,
  set,
  get,
  onDisconnect,
  update,
} from "firebase/database";

// Components
import SignOutLogo from "../components/SignOutLogo.js";
import HelpLogo from "../components/HelpLogo.js";
import SettingsLogo from "../components/SettingsLogo.js";
import LockLogo from "../components/LockLogo.js";
import WaitingForPlayer from "../components/WaitingForPlayer.js";
import Chat from "../components/Chat.js";
import AnimeContext from "../util/AnimationContext.js";
import Popup from "../components/Popup.js";

// Popup components
import PopupLobbyOptions from "../components/PopupLobbyOptions.js";
import PopupHelp from "../components/PopupHelp.js";

// Three.js game
import MainGame from "../game/MainGame";

// Other functions
import { fetchUsername } from "../util/util.js";

export default function Game() {
  // Hooks
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const { lobbyCode } = useParams();
  const [showWaitingForPlayer, setShowWaitingForPlayer] = useState(true);
  const [showStarting, setShowStarting] = useState(false);

  const [myID, setMyID] = useState(null);
  const [player1, setPlayer1] = useState({ name: "", uid: "" });
  const [player2, setPlayer2] = useState({ name: "", uid: "" });
  const { setAnimeBool } = useContext(AnimeContext);

  const [lockLobby, setLockLobby] = useState(false);

  const [showOptionPopUp, setShowOptionPopUp] = useState(false);
  const [showHelpPopUp, setShowHelpPopUp] = useState(false);

  const [type, setType] = useState("");

  // A function to check if two players have joined the lobby -> start the game
  useEffect(() => {
    if (!player1.uid || !player2.uid) {
      setShowWaitingForPlayer(true);
      setShowStarting(false);
    } else {
      setShowStarting(true);
      const timeoutId = setTimeout(() => {
        setShowWaitingForPlayer(false);
      }, 800);

      const setID = async () => {
        const myUserID = user.uid;
        if (myUserID === player1.uid) setMyID(1);
        else if (myUserID === player2.uid) setMyID(2);
        else setMyID(3);
      };

      setID();

      return () => {
        clearTimeout(timeoutId);
      };
    }
    return;
  }, [player1, player2, user]);

  useEffect(() => {
    function setUpKicked() {
      try {
        const userStatusRef = ref(database, `rooms/${lobbyCode}/user-status`);
        let userType = "spectators";

        if (player1.uid === user.uid || player2.uid === user.uid) {
          userType = "players";
        }

        // Set the initial value for the player-status node
        update(userStatusRef, {
          [user.uid]: { type: userType, inLobby: true },
        });
        setType(userType);

        const userRefPath = `rooms/${lobbyCode}/user-status/${user.uid}`;

        const unsubscribe = onValue(ref(database, userRefPath), (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.inLobby === false) {
            const userRef = ref(database, userRefPath);
            set(userRef, null);
            unsubscribe();
            leaveLobby();
          }
        });
      } catch (e) {
        console.log("Status error:", e);
      }
    }
    if (player1.name !== "" && player2.name !== "" && type === "") {
      setUpKicked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1, player2]); // Only player1 and player2 is of intrest

  // A function that is called when Game page is loaded, initializes some listerners and unsubscribers
  useEffect(() => {
    setAnimeBool(false);
    const removePlayerOnClosedWindow = async () => {
      try {
        const removeID = user.uid;
        const playersRef = ref(database, `rooms/${lobbyCode}/players`);

        const snapshot = await get(playersRef);
        if (snapshot.exists()) {
          const userIDs = Object.values(snapshot.val());
          let indexToRemove = userIDs.indexOf(removeID);

          // Set up onDisconnect behavior to remove the player node
          const playerCountRef = ref(
            database,
            `rooms/${lobbyCode}/playerCount`
          );

          const playerCountSnapshot = await get(playerCountRef);

          const playerCount = playerCountSnapshot.val();
          if (playerCount <= 1) {
            const roomRef = ref(database, `rooms/${lobbyCode}`);
            onDisconnect(roomRef).set(null);
          } else {
            const playerRef = ref(
              database,
              `rooms/${lobbyCode}/players/${
                Object.keys(snapshot.val())[indexToRemove]
              }`
            );
            const userStatusRef = ref(
              database,
              `rooms/${lobbyCode}/user-status/${user.uid}`
            );
            onDisconnect(userStatusRef).set(null);

            onDisconnect(playerRef).set(null);
            onDisconnect(playerCountRef).set(Math.max(playerCount - 1, 0));
          }
        } else {
          const lobbyRef = ref(database, `rooms/${lobbyCode}`);
          console.log("No players in the room.");
          set(lobbyRef, null);
          navigate("/");
        }
      } catch (e) {
        navigate("/");
      }
    };

    // Fetches the userID of a player
    const fetchUserID = async (playerNumber) => {
      const playerRef = ref(database, `rooms/${lobbyCode}/players`);

      try {
        const snapshot = await get(playerRef);
        const userIDs = snapshot.val();

        return Object.values(userIDs)[playerNumber - 1];
      } catch (error) {
        console.log("Error in fetchUserID: ", error);
        // For navigate on reload this is commnted above
        return;
      }
    };

    const playerOnChange = () => {
      const playerRef = ref(database, `rooms/${lobbyCode}/players`);
      const unsubscribe = onValue(playerRef, (snapshot) => {
        if (snapshot.exists()) {
          const userIDs = snapshot.val();
          for (let i = 0; i < Object.values(userIDs).length; i++) {
            (async () => {
              const playerIndex = i + 1;
              const userID = await fetchUserID(playerIndex);
              const username = await fetchUsername(userID);

              if (playerIndex === 1) {
                setPlayer1({ name: username, uid: userID });
              } else if (playerIndex === 2) {
                setPlayer2({ name: username, uid: userID });
              }
              if (Object.values(userIDs).length < 2) {
                setShowWaitingForPlayer(true);
                setPlayer2({ name: "", uid: "" });
              }
            })();
          }
        } else {
          console.log("Snapshot does not exist or is null");
        }
      });

      // Cleanup function to unsubscribe from the listener
      return () => {
        unsubscribe();
      };
    };

    fetchUserID(1).then(async (userID) => {
      setPlayer1({ name: await fetchUsername(userID), uid: userID });
    });
    fetchUserID(2).then(async (userID) => {
      setPlayer2({ name: await fetchUsername(userID), uid: userID });
    });

    playerOnChange();

    // Call removePlayer function when component mounts
    removePlayerOnClosedWindow();

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("popstate", handlePopstate);

    // Clean up function: remove onDisconnect behavior when component unmounts
    return () => {
      // You can cancel the onDisconnect here if needed
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("popstate", handleUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyCode, navigate, user]); // Warnings for dependencies are not valid

  // A function to remove a player from the db once they leave the lobby
  const removePlayer = async (removeID) => {
    const playersRef = ref(database, `rooms/${lobbyCode}/players`);
    try {
      const snapshot = await get(playersRef);
      if (snapshot.exists()) {
        const userIDs = Object.values(snapshot.val());
        let indexToRemove = 0;
        for (const u of userIDs) {
          if (u === removeID) {
            break;
          }
          indexToRemove++;
        }

        // Sets the key to nothing (removing it)
        await set(
          ref(
            database,
            `rooms/${lobbyCode}/players/${
              Object.keys(snapshot.val())[indexToRemove]
            }`
          ),
          null
        );
      }
    } catch (e) {
      console.log("Error in removePlayer: ", e);
      return;
    }
  };

  // A function that is called when a user leaves the lobby and updates the db
  const leaveLobby = async () => {
    try {
      // Decrement users count
      const playerCountRef = ref(database, `rooms/${lobbyCode}/playerCount`);
      const playerCountSnapshot = await get(playerCountRef);
      const playerCount = playerCountSnapshot.val();

      // Check if the room should be deleted
      if (
        playerCount <= 1 &&
        (type === "players" ||
          player1.uid === user.uid ||
          player2.uid === user.uid)
      ) {
        // If this is the last user, delete the room
        const roomRef = ref(database, `rooms/${lobbyCode}`);
        await set(roomRef, null);
      } else if (type === "players") {
        // Otherwise, just decrement the users count
        await set(playerCountRef, playerCount - 1);
      }
      const userStatusRef = ref(
        database,
        `rooms/${lobbyCode}/user-status/${user.uid}`
      );
      set(userStatusRef, null);
      removePlayer(user.uid);
      navigate("/Menu");
    } catch (error) {
      console.log("Error leaving room: ", error.message);
      alert("An error occurred while leaving the room. Please try again.");
    }
  };

  // If the user goes back, properly leave the lobby
  const handlePopstate = async () => {
    await leaveLobby();
  };

  // A function that warns the player for refreshing or closing the page -> the player will lose the game
  const handleUnload = (event) => {
    event.preventDefault();
    event.returnValue =
      "Warning: Leaving now will result in the loss the ongoing game";
  };

  // Sync and update lockLobby state with database changes
  useEffect(() => {
    // Function to set lockLobby value in the database
    async function setLock() {
      try {
        const lockRef = ref(database, `rooms/${lobbyCode}/lockedLobby`);
        await set(lockRef, lockLobby); // Set lockLobby in the database
      } catch (e) {
        console.log("Error in lock: ", e);
      }
    }

    // Set lockLobby initially
    setLock();

    // Listen for changes in lockLobby value in the database
    const lockRef = ref(database, `rooms/${lobbyCode}/lockedLobby`);
    const unsubscribe = onValue(lockRef, (snapshot) => {
      const newValue = snapshot.val();
      if (newValue !== null) {
        setLockLobby(newValue); // Update lockLobby state when the database value changes
      }
    });

    return () => {
      // Clean up the listener when the component unmounts
      unsubscribe();
    };
  }, [lockLobby, lobbyCode]);

  // Only player 1 can change the Lobbylock
  const handleLobbyLock = async () => {
    if (user.uid === player1.uid) {
      setLockLobby(!lockLobby);
    }
  };

  return (
    <>
      {user && (
        <section className="game-content-wrapper">
          <section className="game-content-box">
            <div className="game-wrapper">
              <div className="game-bar">
                <button onClick={leaveLobby} className="block">
                  <SignOutLogo />
                </button>
                <button
                  className="block"
                  onClick={() => {
                    setShowHelpPopUp(!showHelpPopUp);
                  }}
                >
                  <HelpLogo />
                </button>
                <button
                  className="block"
                  onClick={() => {
                    setShowOptionPopUp(!showOptionPopUp);
                  }}
                >
                  <SettingsLogo />
                </button>
                <div className="lobby-box">
                  <p className="lobby-text">
                    <span style={{ fontWeight: "bold" }}>Lobby:&nbsp;</span>
                    {lobbyCode}
                  </p>
                  <div className="lock-box">
                    <div onClick={handleLobbyLock}>
                      <LockLogo
                        isLocked={lockLobby}
                        canClick={user.uid === player1.uid}
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-box">
                  <p className="players-text">
                    <span style={{ width: "50%" }}>
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Player 1:&nbsp;
                      </span>
                      <span style={{ color: "var(--player1-color)" }}>
                        {player1.name ? player1.name : "-"}
                      </span>
                    </span>
                    <span style={{ width: "50%" }}>
                      <span
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Player 2:&nbsp;
                      </span>
                      <span style={{ color: "var(--player2-color)" }}>
                        {player2.name ? player2.name : "-"}
                      </span>
                    </span>
                  </p>
                </div>
              </div>
              <div className="game-box">
                {showWaitingForPlayer ? (
                  <WaitingForPlayer
                    Player1={{ name: player1.name }}
                    Player2={{ name: player2.name }}
                    starting={showStarting}
                  />
                ) : (
                  <MainGame
                    url={`rooms/${lobbyCode}`}
                    myID={myID}
                    leaveLobby={leaveLobby}
                  />
                )}
              </div>
            </div>
            <Chat lobbyCode={lobbyCode} />
          </section>

          <Popup
            header={"Lobby options"}
            show={showOptionPopUp}
            setShow={setShowOptionPopUp}
            innerComponent={PopupLobbyOptions}
            innerComponentProps={{ lobbyCode: lobbyCode, admin: player1 }}
          />
          <Popup
            header={"Help"}
            show={showHelpPopUp}
            setShow={setShowHelpPopUp}
            innerComponent={PopupHelp}
          />
        </section>
      )}
    </>
  );
}
