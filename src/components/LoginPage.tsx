import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import mainIcon from "./assets/mainlogo.png";

export function LoginPage({ onLogin, initialIsSignUp = false, onBack }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [nameValid, setNameValid] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    setIsSignUp(Boolean(initialIsSignUp));
  }, [initialIsSignUp]);

  const validateEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailOK = validateEmailOrPhone(email);
    const passwordOK = password.length >= 5;
    const nameOK = isSignUp ? name.trim().length >= 3 : true;

    setEmailValid(emailOK);
    setPasswordValid(passwordOK);
    setNameValid(nameOK);

    if (!emailOK || !passwordOK || !nameOK) {
      setError("Please correct highlighted fields.");
      return;
    }

    setError("");

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
          style={{ top: 20, left: 20, fontSize: 28, color: "#0B3C6C" }}
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

        {/* Toggle buttons */}
        <div
          className="flex"
          style={{
            width: 260,
            justifyContent: "space-between",
            marginTop: 20,
            marginBottom: 30
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

        {/* Form */}
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          {/* Username (signup only) */}
          {isSignUp && (
            <div style={{ width: 260, marginBottom: 12 }}>
              <label className="block text-sm mb-1" style={{ color: "#0B3C6C" }}>
                Username:
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameValid(e.target.value.trim().length >= 3);
                }}
                className="w-full py-2 text-sm"
                style={{
                  paddingLeft: 16,
                  border: `1px solid ${nameValid ? "#C8CFD9" : "#E63946"}`,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 15
                }}
              />

              {!nameValid && (
                <div style={{ fontSize: 11, color: "#E63946", marginTop: 4 }}>
                  Username must be at least 3 characters
                </div>
              )}
            </div>
          )}

          {/* Email / phone */}
          <div style={{ width: 260, marginBottom: 12 }}>
            <label className="block text-sm mb-1" style={{ color: "#0B3C6C" }}>
              Email/Phone:
            </label>

            <input
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailValid(validateEmailOrPhone(e.target.value));
              }}
              className="w-full py-2 text-sm"
              style={{
                paddingLeft: 16,
                border: `1px solid ${emailValid ? "#C8CFD9" : "#E63946"}`,
                backgroundColor: "#F3F4F6",
                borderRadius: 15
              }}
            />

            {!emailValid && (
              <div style={{ fontSize: 11, color: "#E63946", marginTop: 4 }}>
                Enter a valid email or phone number
              </div>
            )}
          </div>

          {/* Password */}
          <div style={{ width: 260, marginBottom: 4 }}>
            <label className="block text-sm mb-1" style={{ color: "#0B3C6C" }}>
              Password:
            </label>

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordValid(e.target.value.length >= 5);
                }}
                className="w-full py-2 text-sm"
                style={{
                  paddingLeft: 16,
                  paddingRight: 42,
                  border: `1px solid ${passwordValid ? "#C8CFD9" : "#E63946"}`,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 15
                }}
              />

              {/* PERFECT eye icon alignment */}
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>

            {!passwordValid && (
              <div style={{ fontSize: 11, color: "#E63946", marginTop: 4 }}>
                Password must be at least 5 characters
              </div>
            )}

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
