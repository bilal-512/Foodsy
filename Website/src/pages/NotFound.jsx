import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  );
}
