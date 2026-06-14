export default function Input({ label, id, className = "", ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={inputId}>{label}</label>}
      <input id={inputId} className={`input ${className}`.trim()} {...props} />
    </div>
  );
}

export function Select({ label, id, children, className = "", ...props }) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={selectId}>{label}</label>}
      <select id={selectId} className={`select ${className}`.trim()} {...props}>
        {children}
      </select>
    </div>
  );
}
