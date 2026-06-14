import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setMessage("Profile updated ✓");
      setForm({ ...form, password: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h2>My Profile</h2>
      {message && <p style={{ color: message.includes('✓') ? 'green' : 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input value={form.name} onChange={handleChange('name')} placeholder="Full name" style={inputStyle} />
        <input value={form.email} onChange={handleChange('email')} placeholder="Email" style={inputStyle} />
        <input value={form.phone} onChange={handleChange('phone')} placeholder="Phone" style={inputStyle} />
        <input value={form.password} onChange={handleChange('password')} placeholder="New password (leave blank to keep)" type="password" style={inputStyle} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle} type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = { padding: 12, borderRadius: 8, border: '1px solid #ddd', width: '100%' };
const btnStyle = { padding: 12, borderRadius: 8, background: '#e85d04', color: '#fff', border: 'none', cursor: 'pointer' };
