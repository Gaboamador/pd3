import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  loginWithEmail,
  registerWithEmail,
  recoverPassword,
  firebaseErrorMessages,
} from "../../firebaseAuth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./AuthScreen.module.scss";

export default function AuthScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState("login"); 
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
          t('auth.msg.login-error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetErrors();

    if (password !== repeatPassword) {
      setError(t('auth.msg.pass.dont-match'));
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
          t('auth.msg.signup-error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    resetErrors();
    setMessage("");

    try {
      setLoading(true);
      await recoverPassword(email);
      setMessage(
        t('auth.msg.recovery-successful')
      );
    } catch (err) {
      setError(
        firebaseErrorMessages[err.code] ??
          t('auth.msg.recovery-error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authScreen}>
      <h2 className={styles.title}>
        {mode === "login" && t('auth.title.login')}
        {mode === "register" && t('auth.title.signup')}
        {mode === "recovery" && t('auth.title.recover')}
      </h2>

      {mode === "login" && (
        <form
          onSubmit={handleLogin}
          className={styles.form}
        >
          <input
            type="email"
            placeholder={t('auth.placeholder.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t('auth.placeholder.pass')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className={styles.loginButtonWrapper}>
            <button
              disabled={loading}
            >
              {t('auth.actions.login')}
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
              {t('auth.title.signup')}
            </button>

            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                resetErrors();
                setMode("recovery");
              }}
            >
              {t('auth.actions.forgot-pass')}
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
            placeholder={t('auth.placeholder.username')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="email"
            placeholder={t('auth.placeholder.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t('auth.placeholder.pass')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className={styles.passwordWrapper}>
            <input
              type={showRepeatPassword ? "text" : "password"}
              placeholder={t('auth.placeholder.pass-repeat')}
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowRepeatPassword(v => !v)}
              tabIndex={-1}
            >
              {showRepeatPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button
            className={styles.primaryButton}
            disabled={loading}
          >
            {t('auth.actions.signup')}
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
              {t('auth.actions.has-account')}
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
            placeholder={t('auth.placeholder.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />

          <button
            className={styles.primaryButton}
            disabled={loading}
          >
            {t('auth.actions.recovery')}
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
              {t('nav.back-to-login')}
            </button>
          </div>
        </form>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {message && <div className={styles.success}>{message}</div>}
    </div>
  );
}
