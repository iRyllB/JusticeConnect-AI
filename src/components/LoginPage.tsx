import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import mainIcon from "./assets/mainlogo.png";

export function LoginPage({ onLogin, initialIsSignUp = false, onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false); // password visibility
  const [error, setError] = useState(""); // dynamic error messages

  useEffect(() => {
    setIsSignUp(Boolean(initialIsSignUp));
  }, [initialIsSignUp]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (isSignUp && !name.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email or phone.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    // Clear error
    setError("");

    // Call onLogin (if defined)
    if (onLogin) {
      onLogin("dummy-access-token", { email, name });
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-full items-center justify-center"
      style={{ backgroundColor: "#E9F2FF", position: "relative" }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="absolute"
          style={{
            top: 20,
            left: 20,
            fontSize: 28,
            color: "#0B3C6C"
          }}
        >
          ←
        </button>
      )}

      <div className="flex flex-col items-center">
        <img
          src={mainIcon}
          alt="logo"
          style={{
            width: 115,
            height: 115,
            objectFit: "contain",
            marginBottom: 14
          }}
        />

        <h1
          className="font-bold"
          style={{
            color: "#0B3C6C",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 18
          }}
        >
          Welcome
        </h1>

        {/* TOGGLE BUTTONS */}
        <div
          className="flex mb-5"
          style={{
            width: 260,
            justifyContent: "space-between",
            marginTop: 20,
            marginBottom: 20
          }}
        >
          <button
            onClick={() => setIsSignUp(false)}
            className="py-2 font-semibold flex-1"
            style={{
              borderRadius: 15,
              backgroundColor: !isSignUp ? "#0B3C6C" : "#D3D8DF",
              color: !isSignUp ? "#FFFFFF" : "#0C3C6C",
              marginRight: 6
            }}
          >
            LOGIN
          </button>

          <button
            onClick={() => setIsSignUp(true)}
            className="py-2 font-semibold flex-1"
            style={{
              borderRadius: 15,
              backgroundColor: isSignUp ? "#0B3C6C" : "#D3D8DF",
              color: isSignUp ? "#FFFFFF" : "#0C3C6C",
              marginLeft: 6
            }}
          >
            SIGN UP
          </button>
        </div>

        {/* FORM */}
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ width: 260, marginBottom: 12 }}>
              <label className="block text-sm mb-1" style={{ color: "#0B3C6C" }}>
                Username:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2 text-sm"
                style={{
                  paddingLeft: 16,
                  border: "1px solid #C8CFD9",
                  backgroundColor: "#F3F4F6",
                  borderRadius: 15
                }}
              />
            </div>
          )}

          <div style={{ width: 260, marginBottom: 12 }}>
            <label className="block text-sm mb-1" style={{ color: "#0B3C6C" }}>
              Email/Phone:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 text-sm"
              style={{
                paddingLeft: 16,
                border: "1px solid #C8CFD9",
                backgroundColor: "#F3F4F6",
                borderRadius: 15
              }}
            />
          </div>

          <div style={{ width: 260, marginBottom: 4, position: "relative" }}>
            <label className="block text-sm mb-1" style={{ color: "#0B3C6C" }}>
              Password:
            </label>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 text-sm"
              style={{
                paddingLeft: 16,
                paddingRight: 40, // space for eye icon
                border: "1px solid #C8CFD9",
                backgroundColor: "#F3F4F6",
                borderRadius: 15
              }}
            />

            {/* Password visibility toggle */}
            <div
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 10,
                top: 34,
                cursor: "pointer"
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>

            {!isSignUp && (
              <div
                className="text-xs"
                style={{
                  textAlign: "right",
                  color: "#E63946",
                  cursor: "pointer",
                  marginTop: 4
                }}
              >
                Forgot Password?
              </div>
            )}
          </div>

          {/* Dynamic Error */}
          {error && (
            <div
              style={{
                color: "#E63946",
                fontSize: 12,
                marginTop: 6,
                textAlign: "center",
                width: 260
              }}
            >
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3 text-sm"
            style={{
              width: 260,
              backgroundColor: "#F5C629",
              color: "#0B3C6C",
              fontWeight: 700,
              borderRadius: 15,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              marginTop: 16
            }}
          >
            {isSignUp ? "SIGN UP" : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
}
