import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import GoogleLogo from "../components/GoogleLogo.js";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import AnimationSwitchButton from "../components/AnimationSwitchButton.js";

import "../styles/style.css";

export default function StartBox() {
  const [user] = useAuthState(auth);
  const provider = new GoogleAuthProvider();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();

  // A function to sign in via mail (Firebase API)
  const mailSignIn = () => {
    try {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => navigate("/Menu")) // Navigate upon successful sign-in
        .catch((error) => {
          setError("Incorrect email or password");
          console.error("Error:", error.message);
        });
    } catch (error) {
      setError("Incorrect email or password");
      console.error("Error:", error.message);
    }
  };

  // A function to create a new user (Firebase API)
  const createAccount = () => {
    if (createPassword !== confirmPassword) {
      setError("Passwords are not matching");
      return;
    }
    createUserWithEmailAndPassword(auth, email, createPassword).catch(
      (error) => {
        if (error.code === "auth/weak-password") {
          setError("Password should be at least 6 characters");
        } else {
          setError("Invalid email");
        }
        console.log("Error: ", error.message);
      }
    );
  };

  // Clear input fields when toggeling from create account to login
  const handleIsLogin = () => {
    // setEmail we want to keep on change as email
    setError("");
    setPassword("");
    setCreatePassword("");
    setConfirmPassword("");

    setIsLogin(!isLogin); // Toggle between login and create account page
  };

  useEffect(() => {
    if (user) {
      navigate("/Menu");
    }
  }, [user, navigate]); // Run effect when user changes

  // Render create account or login depending on what the user wants to do
  const renderForm = () =>
    isLogin ? (
      <>
        <button
          className="start-input-google-button"
          onClick={() => {
            signInWithPopup(auth, provider).catch((error) => {});
          }}
        >
          <GoogleLogo />
          Sign in with Google
        </button>
        <div className="stroke">
          <hr />
          OR
          <hr />
        </div>
        <input
          className="input-field"
          type="text"
          placeholder="Enter email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        ></input>
        <input
          className="input-field"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        ></input>
        <p id="start-error">{error}</p>
      </>
    ) : (
      <>
        <input
          className="input-field"
          type="text"
          placeholder="Enter email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Create password"
          value={createPassword}
          onChange={(event) => {
            setCreatePassword(event.target.value);
          }}
        />
        <input
          className="input-field"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
          }}
        />
        <p id="start-error">{error}</p>
      </>
    );

  return (
    <section className="card-wrapper">
      <section className="card">
        <div>
          <h1>Welcome to Web Golf</h1>
        </div>
        <section className="box-wrapper">
          <div className="sixty-w-box">
            <h2 className="sign-in-h2-text">
              Enter your details to get started!
            </h2>
            <div className="input-box">{renderForm()}</div>
            <div className="enter-button-box">
              <button className="text-enter-button" onClick={handleIsLogin}>
                {isLogin ? "Create account" : "\u2190 Back to login"}
              </button>
              <button
                className="enter-button"
                onClick={isLogin ? mailSignIn : createAccount}
              >
                {isLogin ? "Sign in" : "Create account"}
              </button>
            </div>
          </div>
        </section>
      </section>
      <AnimationSwitchButton />
    </section>
  );
}
