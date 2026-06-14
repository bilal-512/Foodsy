const VARIANT_CLASS = {
  primary: "btn-primary",
  accent: "btn-accent",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

export default function Button({
  children,
  variant = "primary",
  size,
  block,
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    "btn",
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === "sm" ? "btn-sm" : "",
    block ? "btn-block" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
