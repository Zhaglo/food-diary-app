import { NavLink, Outlet, useNavigate } from "react-router";

import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <header className="app-header">
        <div className="brand">Food Diary</div>

        <nav className="app-nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/diary">Diary</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>

        <div className="header-user">
          <span>{user?.username}</span>
          <button type="button" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}