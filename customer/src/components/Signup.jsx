import { useState } from "react";
import { signup } from "../api/api";

export default function Signup({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signup({ name, email, phone, password });
    if (res.token) {
      onLogin(res.token);
    } else {
      setError(res.error || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border p-4 rounded shadow">
      <h2 className="font-bold mb-2">Signup</h2>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border p-1"/>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-1"/>
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="border p-1"/>
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="border p-1"/>
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-green-500 text-white p-2 mt-2 rounded">Signup</button>
    </form>
  );
}

