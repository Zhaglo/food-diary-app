import { Link, Outlet } from "react-router";

export default function AppLayout() {
  return (
    <div>
      <header>
        <nav>
          <Link to="/dashboard">Dashboard</Link>{" | "}
          <Link to="/products">Products</Link>{" | "}
          <Link to="/diary">Diary</Link>{" | "}
          <Link to="/analytics">Analytics</Link>{" | "}
          <Link to="/profile">Profile</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}