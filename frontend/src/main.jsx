import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="26405571332-86pnk8kj9hj8b5j8sgrlnjrmoibm9son.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
