// React and components
import React, { useState, useEffect } from "react";
import Message from "./Message";

// Firebase logic
import { ref as refDatabase, onValue, push } from "firebase/database";
import { auth, database } from "../util/firebase.js";
import { useAuthState } from "react-firebase-hooks/auth";

// Other
import { fetchProfileImage, fetchUsername } from "../util/util.js";

export default function Chat({ lobbyCode }) {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  const [user] = useAuthState(auth);

  const fetchMessages = (roomId) => {
    const messagesRef = refDatabase(database, `rooms/${roomId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(data);
      }
      return () => {
        unsubscribe();
      };
    });
  };

  const sendMessage = async () => {
    if (messageText.trim() === "") return;
    const roomMessagesRef = refDatabase(
      database,
      `rooms/${lobbyCode}/messages`
    );
    push(roomMessagesRef, {
      text: messageText,
      sender: await fetchUsername(user.uid),
      timestamp: new Date().getTime(),
      icon: await fetchProfileImage(user.uid),
    });
    setMessageText("");
  };

  useEffect(() => {
    fetchMessages(lobbyCode);
  }, [lobbyCode]);

  const handEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-box">
      <div className="chat">
        {Object.values(messages).map((message, index) => (
          <Message message={message} key={index} />
        ))}
      </div>
      <div className="chat-input">
        <textarea
          className="chat-input-field"
          type="textarea"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handEnter}
        />
        <div className="chat-button-box">
          <button className="chat-button" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
