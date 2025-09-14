import { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OrderList from "./components/OrderList";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Restore session on reload
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");

    if (storedToken && storedEmail) {
      setToken(storedToken);
      setEmail(storedEmail);
    }

    setUserLoaded(true);
  }, []);

  // Login handler: save both token + email
  const handleLogin = (newToken, newEmail) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("email", newEmail);
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  };

  if (!userLoaded) return <p>Loading...</p>;

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Customer Portal</h1>
        <div className="flex gap-4">
          <Login onLogin={handleLogin} />
          <Signup onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
	  <Dashboard onLogout={handleLogout} />
  );
}

export default App;

