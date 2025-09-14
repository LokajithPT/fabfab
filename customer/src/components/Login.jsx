import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });

      if (res.token) {
        // Save token & user info
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.customer));

        // Optional: notify parent component
        if (onLogin) onLogin(res.token);

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        setError(res.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Check console for details.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border p-4 rounded shadow"
    >
      <h2 className="font-bold mb-2">Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-1"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-1"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-500 text-white p-2 mt-2 rounded">
        Login
      </button>
    </form>
  );
}

