import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginWithEmail,
  registerWithEmail,
  recoverPassword,
  firebaseErrorMessages,
} from "../../firebaseAuth";

import styles from "./AuthScreen.module.scss";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); 
  // "login" | "register" | "recovery"
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetErrors = () => setError("");

  function redirectAfterAuth() {
  const redirect =
    sessionStorage.getItem("pd3_post_auth_redirect");

  if (redirect) {
    sessionStorage.removeItem("pd3_post_auth_redirect");
    navigate(redirect, { replace: true });
  } else {
    navigate("/", { replace: true });
  }
}

  const handleLogin = async (e) => {
    e.preventDefault();
    resetErrors();

    try {
      setLoading(true);
      await loginWithEmail(email, password);
      redirectAfterAuth();
    } catch (err) {
      setError(
        firebaseErrorMessages[err.code] ??
          "Error logging in"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetErrors();

    if (password !== repeatPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail({
        email,
        password,
        firstName,
      });
      redirectAfterAuth();
    } catch (err) {
      setError(
        firebaseErrorMessages[err.code] ??
        err?.message??
          "Error creating account"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    resetErrors();

    try {
      setLoading(true);
      await recoverPassword(email);
      setError(
        "If the email exists you will receive a recovery message"
      );
    } catch (err) {
      setError(
        firebaseErrorMessages[err.code] ??
          "Error sending recovery message"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authScreen}>
      <h2 className={styles.title}>
        {mode === "login" && "Log in to your account"}
        {mode === "register" && "Create Account"}
        {mode === "recovery" && "Recover Password"}
      </h2>

      {mode === "login" && (
        <form
          onSubmit={handleLogin}
          className={styles.form}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />

          <div className={styles.loginButtonWrapper}>
            <button
              disabled={loading}
            >
              LOG IN
            </button>
          </div>

          <div className={styles.authLinks}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                resetErrors();
                setMode("register");
              }}
            >
              Create Account
            </button>

            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                resetErrors();
                setMode("recovery");
              }}
            >
              Forgot your password?
            </button>
          </div>
        </form>
      )}

      {mode === "register" && (
        <form
          onSubmit={handleRegister}
          className={styles.form}
        >
          <input
            type="text"
            placeholder="Username"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className={styles.input}
            required
          />

          <button
            className={styles.primaryButton}
            disabled={loading}
          >
            Crear cuenta
          </button>

          <div className={styles.authLinks}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                resetErrors();
                setMode("login");
              }}
            >
              Ya tengo cuenta
            </button>
          </div>
        </form>
      )}

      {mode === "recovery" && (
        <form
          onSubmit={handleRecovery}
          className={styles.form}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <button
            className={styles.primaryButton}
            disabled={loading}
          >
            Enviar correo
          </button>

          <div className={styles.authLinks}>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                resetErrors();
                setMode("login");
              }}
            >
              Volver al login
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}
