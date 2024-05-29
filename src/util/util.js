import { useState } from "react";
import { ref as refDatabase, set, get } from "firebase/database";
import { database, storage } from "../util/firebase.js";
import {
  getDownloadURL,
  ref as refStorage,
  uploadBytes,
} from "firebase/storage";

// Random starter images for new users
const imagePaths = [
  require("../images/1.jpg"),
  require("../images/2.jpg"),
  require("../images/3.jpg"),
  require("../images/4.jpg"),
  require("../images/5.jpg"),
  require("../images/6.jpg"),
];

// returns which our of the day it is
export function ClockHour() {
  const [currentHour] = useState(new Date().getHours());

  return parseInt(currentHour);
}

// Returns different greeting based on the time of day
export function typeOfDay() {
  const hour = ClockHour();
  let time = "";

  if (6 <= hour && hour < 10) {
    time = "Good morning";
  } else if (13 <= hour && hour < 17) {
    time = "Good afternoon";
  } else if (17 <= hour && hour < 21) {
    time = "Good evening";
  } else if ((21 <= hour && hour < 24) || hour < 6) {
    time = "Late night";
  } else {
    time = "Good day";
  }

  return time;
}

// Creates a new user if it's the users first time
export async function createUserIfNotExist(user) {
  if (!user) return;

  let name = "";

  const userRef = refDatabase(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // --- Create data for real time database ---

    // Create the user in the database
    if (user.displayName && user.displayName.trim()) {
      name = user.displayName.split(" ")[0];
    }
    // Email login
    else {
      name = user.email?.split(/[@.]/).shift();
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    const newData = {
      name: name,
      wins: 0,
      losses: 0,
      shots: 0,
      ratio: (0.0).toFixed(2),
    };
    await set(userRef, newData);

    // --- Set a stock profile image for the new user in Storage

    // Choose randomly one of six stock images
    const randomNumber = Math.floor(Math.random() * 6) + 1;

    // Convert from URL to blob (it's like a file)
    const response = await fetch(imagePaths[randomNumber]);
    const blob = await response.blob();

    // Upload to Firebase Storage
    const profileImageRef = refStorage(
      storage,
      `users/${user.uid}/profileImage`
    );
    await uploadBytes(profileImageRef, blob);
  }
}

// Fetches username based on userID
export async function fetchUsername(userID) {
  const nameRef = refDatabase(database, `users/${userID}/name`);
  const snapshot = await get(nameRef);

  if (!snapshot.exists()) return "";

  return snapshot.val();
}

// Fetch the profile image from Firebase Storage
export const fetchProfileImage = async (userID) => {
  try {
    // Find the image URL based on Users UID
    const profileImageRef = refStorage(storage, `users/${userID}/profileImage`);
    const url = await getDownloadURL(profileImageRef);
    return url;
  } catch (error) {
    // Put a placeholder image if object is not found
    if (error.code === "storage/object-not-found") {
      // If new, set the profile image URL to the starter image
      const placeholderRef = refStorage(storage, "placeholderProfile.png");
      const placeholderURL = await getDownloadURL(placeholderRef);
      return placeholderURL;
    } else {
      console.error("Error fetching profile image:", error);
      return;
    }
  }
};
