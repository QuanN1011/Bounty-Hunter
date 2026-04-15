import { useState } from "react";

function RegisterForm({ onRegister }) {
  const [fields, setFields] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const username = fields.username.trim();
    if (!username || !fields.password) {
      setError("Username and password are required.");
      return;
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces.");
      return;
    }
    if (fields.password !== fields.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await onRegister(username, fields.password);
    if (!result.ok) {
      setError(result.message || "Registration failed.");
      return;
    }

    setMessage("Account created. Switch to Login and sign in.");
    setFields({ username: "", password: "", confirmPassword: "" });
  }

  return (
    <section className="auth-card">
      <h2>Sign Up</h2>
      {error ? <p className="form-message form-message--error">{error}</p> : null}
      {message ? <p className="form-message form-message--ok">{message}</p> : null}
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={fields.username}
          onChange={(e) => setFields((p) => ({ ...p, username: e.target.value }))}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={fields.password}
          onChange={(e) => setFields((p) => ({ ...p, password: e.target.value }))}
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={fields.confirmPassword}
          onChange={(e) =>
            setFields((p) => ({ ...p, confirmPassword: e.target.value }))
          }
          autoComplete="new-password"
        />
        <button className="btn-primary" type="submit">Create Account</button>
      </form>
    </section>
  );
}

export default RegisterForm;
