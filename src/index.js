import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { HelmetProvider } from "react-helmet-async";

import { AuthProvider } from "./context/AuthContext";

import App from "./App";

import reportWebVitals from "./reportWebVitals";

// ================= THEME =================

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

// ================= ROOT =================

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

// ================= RENDER =================

root.render(
  <React.StrictMode>

    <HelmetProvider>

      <AuthProvider>

        <ThemeProvider theme={theme}>

          <CssBaseline />

          <App />

        </ThemeProvider>

      </AuthProvider>

    </HelmetProvider>

  </React.StrictMode>
);

// ================= SERVICE WORKER (PWA) =================

if (process.env.NODE_ENV === "production") {

  if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

      navigator.serviceWorker
        .register("/service-worker.js")

        .then((registration) => {

          console.log(
            "Service Worker registered:",
            registration
          );

          registration.update();

          registration.onupdatefound = () => {

            const installingWorker =
              registration.installing;

            installingWorker.onstatechange = () => {

              if (
                installingWorker.state === "installed"
              ) {

                if (
                  navigator.serviceWorker.controller
                ) {

                  console.log(
                    "New version available. Updating..."
                  );

                  installingWorker.postMessage({
                    type: "SKIP_WAITING"
                  });

                  window.location.reload();

                } else {

                  console.log(
                    "App cached for offline use"
                  );

                }

              }

            };

          };

        })

        .catch((error) => {

          console.error(
            "Service Worker registration failed:",
            error
          );

        });

    });

  }

}

// ================= PERFORMANCE =================

reportWebVitals();