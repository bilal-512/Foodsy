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

export default function Register({ role = "customer" }) {
  const { registerRole } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const endpointRole = role === "customer" ? "customer" : role === "rider" ? "rider" : "admin";
  const title = role === "customer" ? "Register" : `Register as ${endpointRole.charAt(0).toUpperCase() + endpointRole.slice(1)}`;

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const name = form.name.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const user = await registerRole({ name, email, password }, endpointRole);
      const home = ROLE_HOME[user?.role] || ROLE_HOME.customer;
      navigate(home);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{ margin: 0 }}>{title}</h2>
        {error && <div className="alert alert-error" style={{ marginTop: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <Input label="Name" required value={form.name} onChange={handleChange("name")} placeholder="Your name" />
          <Input label="Email" required type="email" value={form.email} onChange={handleChange("email")} placeholder="you@email.com" />
          <Input label="Password" required type="password" value={form.password} onChange={handleChange("password")} placeholder="Create a password" />
          <Button type="submit" block>Register</Button>
        </form>
      </div>
    </div>
  );
}
