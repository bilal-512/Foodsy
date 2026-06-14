import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const ROLE_HOME = {
  customer: "/menu",
  admin: "/admin/dashboard",
  rider: "/employee/orders",
  employee: "/employee/orders",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || "/menu");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ margin: 0 }}>Login</h2>
        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />
          <Button type="submit" block>Login</Button>
        </form>
      </div>
    </div>
  );
}
