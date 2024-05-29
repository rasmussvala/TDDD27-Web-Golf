import React from "react";

export default function LeaderboardCard({ user, index, sortBy }) {
  return (
    <li>
      <div
        style={{
          paddingRight: "10px",
          color: "var(--dark-blue)",
          width: "5vw",
        }}
      >
        <h3>{`#${index + 1}`}</h3>
      </div>
      <div style={{ paddingRight: "10px" }}>
        <img
          src={user.profileImg}
          alt="Profile"
          className="leaderboard-profile-img"
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            color: "var(--black)",
            fontWeight: "500",
          }}
        >{`${user.name}`}</div>
        <div style={{ color: "var(--chat-date-color)" }}>
          {user[sortBy]} {sortBy}
        </div>
      </div>
    </li>
  );
}
