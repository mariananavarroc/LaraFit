import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#F8F6F4", fontFamily: "'DM Sans', sans-serif" }}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
