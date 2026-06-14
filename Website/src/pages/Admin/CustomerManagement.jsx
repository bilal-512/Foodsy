import { useEffect, useState } from "react";
import api from "../../services/api";
import Modal from "../../components/Modal";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  const fetch = () => api.get("/admin/customers").then(r => setCustomers(r.data)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const handleChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    try {
      if (editingId) {
        await api.put(`/admin/customers/${editingId}`, form);
        setMessage("Customer updated ✓");
        setEditingId(null);
      } else {
        await api.post(`/admin/customers`, form);
        setMessage("Customer added ✓");
      }
      setForm({ name: "", email: "" });
      fetch();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  const edit = (c) => { setEditingId(c.user_id); setForm({ name: c.name, email: c.email }); setMessage(""); };
  const remove = (c) => {
    setModalMessage(`Remove ${c.name}?`);
    setOnConfirm(() => async () => { await api.delete(`/admin/customers/${c.user_id}`); fetch(); setModalOpen(false); });
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ color: '#e85d04' }}>Customer Management</h2>

      <div style={{ background: '#fff', padding:20, borderRadius:8, marginBottom:20 }}>
        <h3>{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
        {message && <p style={{color: message.includes('✓') ? 'green' : 'red'}}>{message}</p>}
        <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap:12 }}>
          <input placeholder="Name" value={form.name} onChange={handleChange('name')} style={{padding:10,borderRadius:6,border:'1px solid #ddd'}} />
          <input placeholder="Email" value={form.email} onChange={handleChange('email')} style={{padding:10,borderRadius:6,border:'1px solid #ddd'}} />
        </div>
        <button onClick={submit} style={{ marginTop:12, padding:10, background:'#e85d04', color:'#fff', border:'none', borderRadius:6 }}>{editingId ? 'Update' : 'Add'}</button>
      </div>

      <div style={{ background:'#fff', padding:20, borderRadius:8 }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.user_id}>
                <td>{c.user_id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>
                  <button onClick={() => edit(c)} style={{marginRight:8}}>Edit</button>
                  <button onClick={() => remove(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} title="Confirm" message={modalMessage} onCancel={() => setModalOpen(false)} onConfirm={onConfirm} />
    </div>
  );
}
