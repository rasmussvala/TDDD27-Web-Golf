// Other
import React, { useEffect, useState } from "react";
import { fetchProfileImage, fetchUsername } from "../util/util";

// Firebase
import { ref, get } from "firebase/database";
import { database, auth } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";

// Components
import BackButton from "../components/BackButton";
import LeaderboardCard from "../components/LeaderboardCard.js";
import AnimationSwitchButton from "../components/AnimationSwitchButton.js";

// CSS
import "../styles/globalstats.css";

export default function Global() {
  // Leaderboard hooks
  const [leaderboard, setLeaderboard] = useState([]);
  const [sortBy, setSortBy] = useState("wins");

  // User hooks
  const [user, loading] = useAuthState(auth);
  const [myStats, setMyStats] = useState(null);
  const [myImageUrl, setMyImageUrl] = useState(null);
  const [myRanking, setMyRanking] = useState(null);
  const [myName, setMyName] = useState("");

  // Fetches the leaderboard when mounted
  useEffect(() => {
    async function fetchLeaderboard() {
      const statRef = ref(database, "users");
      const statSnapshot = await get(statRef);
      const statVal = statSnapshot.val();

      // Create an array of promises for fetching profile images
      const profileImagePromises = Object.keys(statVal).map(async (userID) => {
        const profileImg = await fetchProfileImage(userID);
        return { id: userID, profileImg };
      });

      // Wait for all profile images to be fetched
      const usersWithProfileImages = await Promise.all(profileImagePromises);

      // Merge profile images with user data
      const usersArray = usersWithProfileImages.map(({ id, profileImg }) => {
        return {
          id,
          profileImg,
          ...statVal[id],
        };
      });

      setLeaderboard(usersArray);
    }
    fetchLeaderboard();
  }, []);

  // Fetches the users profile image when the user is loaded
  useEffect(() => {
    if (!user || loading) return;

    const setNameAndImageForUser = async () => {
      const url = await fetchProfileImage(user.uid);

      setMyName(await fetchUsername(user.uid));
      setMyImageUrl(url);
    };

    setNameAndImageForUser();
  }, [loading, user]);

  // Updates leaderboard and user based on sorting
  useEffect(() => {
    async function sortLeaderboard() {
      // Sort the array based on criteria and order
      const sortedLeaderboard = leaderboard.sort((a, b) => {
        return b[sortBy] - a[sortBy];
      });

      setLeaderboard(sortedLeaderboard);
    }

    async function updateUserstat() {
      if (!user || loading) return;

      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      const userVals = userSnapshot.val();

      // Return the stat based on the active sorting
      const statValue = userVals[sortBy];

      setMyStats(statValue);

      // Find user's index in the sorted array
      const sortedLeaderboardIds = leaderboard.map((user) => user.id);
      const userIndex = sortedLeaderboardIds.indexOf(user.uid);

      // Calculate user's ranking
      const userRanking = userIndex + 1;
      setMyRanking(userRanking);
    }

    sortLeaderboard();
    updateUserstat();
  }, [leaderboard, loading, sortBy, user]);

  // Update sorting
  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
  };

  return (
    <section className="card-wrapper">
      <section className="global-card">
        <div className="global-header-box">
          <BackButton />
        </div>
        <section className="global-box-wrapper">
          <div className="my-profile-wrapper">
            {myStats !== null && myImageUrl && (
              <div className="my-profile">
                <h2 id="rank">Rank: {`${myRanking}`}</h2>
                <img
                  src={myImageUrl}
                  alt="Profile"
                  className="big-profile-img"
                />
                <h3 id="myName">{myName ? myName : ""}</h3>
                <div className="my-content">
                  <p style={{ margin: "2px", fontSize: "1.2rem" }}>
                    {`${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`}:{" "}
                    {` ${myStats}`}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="scoreboard-wrapper">
            <div className="scoreboard-header-wrapper">
              <h2>Global scoreboard</h2>
            </div>
            <div className="scoreboard">
              <div className="scoreboard-options">
                <span>Sort By: </span>
                <select
                  style={{ fontSize: "14px" }}
                  value={sortBy}
                  onChange={handleSortByChange}
                  className="select-options"
                >
                  <option value="wins">Wins</option>
                  <option value="ratio">Win/Loss</option>
                  <option value="losses">Losses</option>
                  <option value="shots">Shots</option>
                </select>
              </div>
              <ul>
                {leaderboard.map((user, index) => (
                  <LeaderboardCard
                    key={user.id}
                    user={user}
                    index={index}
                    sortBy={sortBy}
                  />
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>
      <AnimationSwitchButton />
    </section>
  );
}
