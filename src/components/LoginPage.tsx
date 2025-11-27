import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import mainIcon from "./assets/mainlogo.png";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface LoginPageProps {
  onLogin: (accessToken: string, user: any) => void;
  initialIsSignUp?: boolean;
  onBack?: () => void;
  onContinueAsFree?: () => void;
}

export function LoginPage({ onLogin, initialIsSignUp = false, onBack }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [nameValid, setNameValid] = useState(true);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(Boolean(initialIsSignUp));
  }, [initialIsSignUp]);

  const validateEmailOrPhone = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const submitAuth = async () => {

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
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Call server function to create a new user (auto-confirmed) if available
        let createSuccess = false;
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-a76efa1a/signup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({ email, password, name }),
            }
          );
          const bodyText = await response.text();
          try {
            const bodyJson = JSON.parse(bodyText);
            console.log('Server signup response:', response.status, bodyJson);
          } catch { console.log('Server signup response text:', response.status, bodyText); }
          if (response.ok) {
            createSuccess = true;
          } else {
            // Not fatal: we'll fall back to client-side signUp
            console.warn('Server signup function returned error:', response.status, bodyText);
            try {
              const json = JSON.parse(bodyText);
              const errMsg = json?.error || json?.message || json?.detail || bodyText;
              setError(errMsg || 'Failed to sign up (server error)');
              // If server says email already registered, suggest sign-in
              if (errMsg && typeof errMsg === 'string' && errMsg.toLowerCase().includes('already')) {
                setTimeout(() => { setIsSignUp(false); setError('');}, 1500);
                return;
              }
            } catch (parseErr) {
              // ignore parse error and continue fallback
            }
          }
        } catch (err) {
          console.warn('Server signup call failed (function not deployed or network error). Falling back to client signUp', err);
        }

        if (!createSuccess) {
          // Client side sign up
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) {
            // Show friendly message and detailed logging for debugging
            console.error('Client signUp error', signUpError);
            throw new Error(signUpError.message || 'Failed to sign up');
          }

          // If signUp succeeded but no session is present, the user may need to confirm their email
          if (signUpData?.user && !signUpData?.session) {
            setError('Signup successful. Please check your email and confirm to sign in.');
            return; // stop here; don't attempt sign in
          }
          // If the client signUp created a session, fall-through to sign-in handling below
        }

        // Sign in after signup (attempt automatic signin)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Handle common error reasons and show friendly messages
          console.error('signInWithPassword after signup failed:', signInError);
          const msg = signInError.message || 'Failed to sign in after signup';
          if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
            setError('Invalid login credentials. Please check your email and password.');
          } else if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm')) {
            setError('Please confirm your email before signing in.');
          } else {
            setError(msg);
          }
          return;
        }

        if (signInData?.session?.access_token) {
          onLogin(signInData.session.access_token, signInData.user);
          return;
        }
      } else {
        // Sign in flow
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          console.error('Sign in failed:', signInError);
          const msg = signInError.message || 'Failed to sign in';
          if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
            setError('Invalid email or password.');
          } else {
            setError(msg);
          }
          return;
        }
        if (signInData.session?.access_token) {
          onLogin(signInData.session.access_token, signInData.user);
          return;
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err?.message || String(err) || 'Authentication failed';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        setError('Network error contacting the server. Please check your connection and try again.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitAuth();
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
                color: "var(--brand-danger)",
                fontSize: 12,
                marginTop: 6,
                textAlign: "center",
                width: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => submitAuth()}
                className="underline text-sm"
                style={{ color: 'var(--brand-blue)' }}
              >
                Retry
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-sm"
            style={{
              width: 260,
              backgroundColor: "#F5C629",
              color: "#0B3C6C",
              fontWeight: 700,
              borderRadius: 15,
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              marginTop: 16,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Please wait...' : (isSignUp ? 'SIGN UP' : 'LOGIN')}
          </button>
        </form>
      </div>
    </div>
  );
}
