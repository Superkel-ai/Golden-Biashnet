import React from "react";

export default function SplashScreen() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "#000", // full dark background
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <img
        src="/logo.png"
        alt="Golden Biashnet"
        style={{
          width: 400,
          height: 400,
          

          animation: "fadeIn 3s ease-in-out",
          objectFit: "contain"

        }}
      />
    </div>
  );
}