import React from "react";

export default function Modal({ open, title = '', message = '', onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div style={overlay}>
      <div style={box}>
        {title && <h3 style={{ margin: 0 }}>{title}</h3>}
        <p style={{ marginTop: 12 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onCancel} style={cancelBtn}>Cancel</button>
          <button onClick={onConfirm} style={confirmBtn}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 };
const box = { background: '#fff', padding: 20, borderRadius: 8, width: 420, boxShadow: '0 12px 40px rgba(2,6,23,0.3)' };
const cancelBtn = { padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' };
const confirmBtn = { padding: '8px 12px', borderRadius: 6, border: 'none', background: '#e85d04', color: '#fff', cursor: 'pointer' };
