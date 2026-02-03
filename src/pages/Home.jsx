import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h1>PD3</h1>

      <ul style={{ display: "grid", gap: 12, paddingLeft: 18 }}>
        <li>
          <Link to="/randomizer">Randomizer</Link>
        </li>
        <li>
          <Link to="/build-editor">Build Editor</Link>
        </li>
      </ul>
    </div>
  );
}
