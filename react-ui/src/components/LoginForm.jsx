import { useState } from "react";

function LoginForm({ onLogin }) {
  const [fields, setFields] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const username = fields.username.trim();
    if (!username || !fields.password) {
      setError("Username and password are required.");
      return;
    }
    if (username.includes(" ")) {
      setError("Username cannot contain spaces.");
      return;
    }

    const ok = await onLogin(username, fields.password);
    if (!ok) {
      setError("Login failed. Check username/password.");
    }
  }

  return (
    <section className="auth-card">
      <h2>Login</h2>
      {error ? <p className="form-message form-message--error">{error}</p> : null}
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
          autoComplete="current-password"
        />
        <button className="btn-primary" type="submit">Login</button>
      </form>
    </section>
  );
}

export default LoginForm;