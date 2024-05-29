import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { storage, auth, database } from "../util/firebase";
import {
  ref as refStorage,
  getDownloadURL,
  uploadBytes,
} from "firebase/storage";
import { get, set, ref as refDatabase } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import "../styles/statistics.css";
import { fetchProfileImage } from "../util/util";
import AnimationSwitchButton from "../components/AnimationSwitchButton.js";

export default function Statistics() {
  const [user, loading] = useAuthState(auth);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // Fetches player data and displayes the profile image
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        if (user && !loading) {
          const playerRef = refDatabase(database, `users/${user.uid}`);
          const snapshot = await get(playerRef);

          // Existing user, update page with user's data
          if (snapshot.exists()) {
            setPlayerData(snapshot.val());
            setUsername(snapshot.val().name);
          } else {
            // No user found
            console.log("Couldn't find player: " + user.uid);
          }
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    const setPlayerProfileImage = async () => {
      const url = await fetchProfileImage(user.uid);
      setProfileImageUrl(url);
    };

    if (user && !loading) {
      fetchPlayerData();
      setPlayerProfileImage();
    }
  }, [loading, user]);

  // Changes the profile image
  const profileImageChange = async (event) => {
    try {
      // Get the file from the input field
      const file = event.target.files[0];

      // Upload file to Firebase Storage
      const profileImageRef = refStorage(
        storage,
        `users/${user.uid}/profileImage`
      );
      await uploadBytes(profileImageRef, file);

      // Fetch the new image
      const url = await getDownloadURL(profileImageRef);
      setProfileImageUrl(url);
    } catch (error) {
      console.error("Error changing profile image:", error);
    }
  };

  // Changes the username
  const changeUsername = () => {
    const usernameRef = refDatabase(database, "users/" + user.uid + "/name");
    get(usernameRef).then((snapshot) => {
      if (!snapshot.exists()) return;
      if (
        newUsername === "" ||
        newUsername.length > 24 ||
        newUsername.includes(" ")
      ) {
        console.log("Not valid");
        setError("Not a valid name!");
        return;
      } else {
        setError("");
      }
      set(usernameRef, newUsername);
      setUsername(newUsername);
      setNewUsername(""); // clear the input field
    });
  };

  return (
    <>
      {user && !loading && playerData && (
        <section className="card-wrapper">
          <section className="card">
            <div className="back">
              <BackButton />
            </div>
            <div className="statistics-content-wrapper">
              <h1>{username}</h1>
              <div className="statistics-content-wrapper">
                <div className="content">
                  <div className="img-content">
                    {profileImageUrl && (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="profile-img"
                      />
                    )}
                    <label for="file-upload" className="file-upload">
                      Upload new profile image
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={profileImageChange}
                      className="file-input"
                    />
                    <div className="change-username-container">
                      <div className="field-wrapper">
                        <input
                          type="text"
                          value={newUsername}
                          placeholder="Enter new username"
                          className="change-username-input-field"
                          onChange={(event) => {
                            setNewUsername(event.target.value);
                          }}
                        />

                        <button
                          onClick={changeUsername}
                          className="change-username-button"
                        >
                          Change
                        </button>
                      </div>
                      <p className="error">{error}</p>
                    </div>
                  </div>
                  <div className="data-wrapper">
                    <div className="data-headers">
                      <ul>
                        <h2>Wins:</h2>
                      </ul>
                      <ul>
                        <h2>Losses:</h2>
                      </ul>
                      <ul>
                        <h2>Shots:</h2>
                      </ul>
                      <ul>
                        <h2>W/L Ratio:</h2>
                      </ul>
                    </div>
                    <div className="data">
                      <ul>
                        <h2>{playerData.wins}</h2>
                      </ul>
                      <ul>
                        <h2>{playerData.losses}</h2>
                      </ul>
                      <ul>
                        <h2>{playerData.shots}</h2>
                      </ul>
                      <ul>
                        <h2>{playerData.ratio}</h2>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <AnimationSwitchButton />
        </section>
      )}
    </>
  );
}
