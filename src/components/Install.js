import React, { useEffect, useState } from "react";

export default function Install() {

  const [prompt, setPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  /* ================= INSTALL PROMPT ================= */

  useEffect(() => {

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setPrompt(e);
      setShowInstall(true);
    });

  }, []);

  const installApp = async () => {

    if (!prompt) return;

    prompt.prompt();
    await prompt.userChoice;

    setPrompt(null);
    setShowInstall(false);

  };

  /* ================= SERVICE WORKER UPDATE ================= */

  useEffect(() => {

    if ("serviceWorker" in navigator) {

      navigator.serviceWorker.register("/service-worker.js")
        .then((registration) => {

          if (registration.waiting) {
            setUpdateAvailable(true);
            setWaitingWorker(registration.waiting);
          }

          registration.addEventListener("updatefound", () => {

            const newWorker = registration.installing;

            newWorker.addEventListener("statechange", () => {

              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {

                setUpdateAvailable(true);
                setWaitingWorker(newWorker);

              }

            });

          });

        });

    }

  }, []);

  const updateApp = () => {

    if (!waitingWorker) return;

    waitingWorker.postMessage({ type: "SKIP_WAITING" });

    window.location.reload();

  };

  /* ================= UI ================= */

  if (!showInstall && !updateAvailable) return null;

  return (

    <div style={styles.container}>

      <span style={styles.text}>
        {updateAvailable
          ? "New version available 🚀"
          : "Install Golden Biashnet"}
      </span>

      {updateAvailable ? (
        <button onClick={updateApp} style={styles.button}>
          Update
        </button>
      ) : (
        <button onClick={installApp} style={styles.button}>
          Install
        </button>
      )}

    </div>

  );

}

const styles = {

  container: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#F4B400",
    color: "#000",
    padding: "10px 15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 9999
  },

  text: {
    fontWeight: "bold"
  },

  button: {
    background: "#000",
    color: "#F4B400",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: "bold",
    cursor: "pointer"
  }

};