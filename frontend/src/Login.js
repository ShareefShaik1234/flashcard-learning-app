import { useState } from "react";

function Login({ setPage }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    localStorage.setItem("username", email);

    alert("Login successful");
    setPage("home");
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;
