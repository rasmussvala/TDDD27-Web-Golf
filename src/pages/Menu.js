import "../styles/style.css";
import { typeOfDay } from "../util/util.js";
import { auth } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SignOutLogo from "../components/SignOutLogo.js";
import { createUserIfNotExist, fetchUsername } from "../util/util.js";
import AnimationSwitchButton from "../components/AnimationSwitchButton.js";

export default function Menu() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [username, setUsername] = useState("...");

  // If user is not logged in, navigate back to sign in
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Creates a new user or fetches current data and greet the player
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        createUserIfNotExist(user);
        setUsername(await fetchUsername(user.uid));
      }
    };

    fetchData();
  }, [user]);

  return (
    <section className="card-wrapper">
      <section className="card">
        <div className="header-box">
          <button onClick={() => auth.signOut()} className="sign-out-button">
            <SignOutLogo />
          </button>
          <h1>
            {typeOfDay()} {username}
          </h1>
        </div>
        <section className="box-wrapper">
          <div className="half-w-box">
            <h2>Choose your action</h2>
            <div className="col-button-box">
              <button
                className="menu-button"
                onClick={() => navigate("/JoinGame")}
              >
                Join Game
              </button>
              <button
                className="menu-button"
                onClick={() => navigate("/FindGame")}
              >
                Find Game
              </button>
              <button
                className="menu-button"
                onClick={() => navigate("/Statistics")}
              >
                Statistics
              </button>
              <button
                className="menu-button"
                onClick={() => navigate("/Global")}
              >
                Global Ranking
              </button>
            </div>
          </div>
        </section>
      </section>
      <AnimationSwitchButton />
    </section>
  );
}
