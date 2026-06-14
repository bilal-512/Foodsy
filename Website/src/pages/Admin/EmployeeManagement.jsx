import { useEffect, useState } from "react";
import api from "../../services/api";
import Modal from "../../components/Modal";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "rider", area: "", address: "" });
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(() => () => {});

  const fetchEmployees = () =>
    api.get("/admin/employees").then(r => setEmployees(r.data)).catch(console.error);

  useEffect(() => { fetchEmployees(); }, []);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/admin/employees/${editingId}`, form);
        setMessage("Employee updated ✓");
        setEditingId(null);
      } else {
        await api.post("/admin/employees", form);
        setMessage("Employee added ✓");
      }
      setForm({ name: "", email: "", role: "rider", area: "", address: "" });
      fetchEmployees();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  const handleEdit = (emp) => {
    setEditingId(emp.user_id);
    setForm({ name: emp.full_name || emp.name || "", email: emp.email || "", role: emp.role || "rider", area: emp.area || "" });
    setMessage("");
  };

  const handleDelete = (emp) => {
    setModalMessage(`Remove ${emp.full_name || emp.name}?`);
    setOnConfirm(() => async () => {
      try {
        await api.delete(`/admin/employees/${emp.user_id}`);
        setMessage("Removed ✓");
        fetchEmployees();
      } catch (err) {
        setMessage(err.response?.data?.message || "Error removing");
      } finally {
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Employee Management</h2>
      <div style={styles.formCard}>
        <h3>Add Employee</h3>
        {message && <p style={{color:"green"}}>{message}</p>}
        <div style={styles.formGrid}>
          <input placeholder="Name" value={form.name} onChange={handleChange("name")} style={styles.input} />
          <input placeholder="Email" value={form.email} onChange={handleChange("email")} style={styles.input} />
          <select value={form.role} onChange={handleChange("role")} style={styles.input}>
            <option value="rider">Rider</option>
            <option value="employee">Employee</option>
          </select>
          <input placeholder="Area" value={form.area} onChange={handleChange("area")} style={styles.input} />
          <input placeholder="Address (street)" value={form.address} onChange={handleChange("address")} style={styles.input} />
        </div>
        <button style={styles.btn} onClick={handleSubmit}>{editingId ? 'Save' : 'Add Employee'}</button>
      </div>

      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Area</th><th>Actions</th></tr></thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.user_id}>
                <td>{emp.user_id}</td>
                <td>{emp.full_name || emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.role}</td>
                <td>{emp.area}</td>
                <td>
                  <button onClick={() => handleEdit(emp)} style={{marginRight:8}}>Edit</button>
                  <button onClick={() => handleDelete(emp)}>Delete</button>
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

const styles = {
  page: { padding: "24px 32px", maxWidth: 1000, margin: "0 auto" },
  heading: { color: "#e85d04" },
  formCard: { background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 24 },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 12 },
  input: { padding: 10, borderRadius: 6, border: "1px solid #ddd", width: "100%" },
  btn: { background: "#e85d04", color: "#fff", border: "none", padding: 10, borderRadius: 6, cursor: "pointer" },
  tableCard: { background: "#fff", padding: 20, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 }
};
