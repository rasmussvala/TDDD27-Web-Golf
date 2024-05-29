import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App.js";
import { AnimeProvider } from "./util/AnimationContext.js";
import Background from "./components/Background.js";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  // Enable StrictMode to detect common bugs in your components early during development.

  // What StrictMode does:
  // - Components will re-render an extra time to find bugs caused by impure rendering.
  // - Effects will re-run an extra time to find bugs caused by missing Effect cleanup.
  // - Components will be checked for usage of deprecated APIs.

  // <React.StrictMode>
  <AnimeProvider>
    <Background />
    <App />
  </AnimeProvider>
  // </React.StrictMode>
);
