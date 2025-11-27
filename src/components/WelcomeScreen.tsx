import React from "react";
import mainIcon from "./assets/mainlogo.png"; // adjust path as needed

interface WelcomeScreenProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onContinueAsGuest: () => void;
  onBack: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLoginClick,
  onSignUpClick,
  onContinueAsGuest,
}) => {
  return (
    <div
      className="flex h-screen w-full justify-center items-center px-6 font-inter"
      style={{ backgroundColor: "#F0F8FF" }}
    >
      <div className="flex flex-col items-center max-w-[412px]">

        {/* LOGO */}
        <img
          src={mainIcon}
          alt="Logo"
          style={{
            width: 150,
            height: 150,
            borderRadius: "9999px",
            marginBottom: 28,
          }}
        />

        {/* TITLE */}
        <h1
          className="text-center font-bold"
          style={{
            color: "#0B3C6C",
            fontSize: 28,
            marginBottom: 36,
          }}
        >
          Ready to Connect?
        </h1>

        {/* LOGIN BUTTON */}
        <button
          onClick={onLoginClick}
          className="font-bold"
          style={{
            backgroundColor: "#F5C629",
            width: "252px",
            height: "47px",
            borderRadius: "47px",
            fontSize: "15px",
            color: "#0B3C6C",
            marginBottom: 14,
          }}
        >
          Login
        </button>

        {/* SIGN UP BUTTON */}
        <button
          onClick={onSignUpClick}
          className="font-bold"
          style={{
            backgroundColor: "#0B3C6C",
            width: "252px",
            height: "47px",
            borderRadius: "47px",
            fontSize: "15px",
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Sign Up
        </button>

        {/* OR */}
        <p
          className="text-sm"
          style={{
            color: "#333",
            marginBottom: 10,
          }}
        >
          OR
        </p>

        {/* CONTINUE AS GUEST — Clickable Styled Text */}
        <p
          onClick={onContinueAsGuest}
          className="font-bold cursor-pointer transition-all duration-200 hover:underline hover:opacity-80"
          style={{
            fontSize: "15px",
            color: "#0B3C6C",
            marginBottom: 32,
          }}
        >
          Continue as Guest
        </p>

      </div>
    </div>
  );
};

export default WelcomeScreen;
