import { useState } from "react";
import axios from "axios";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  // save user locally
  localStorage.setItem("username", email);

  alert("Login successful");
  setPage("home");
};

    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default Login;
