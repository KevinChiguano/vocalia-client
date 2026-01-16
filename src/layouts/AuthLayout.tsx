import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <div
    className="
  min-h-screen flex items-center justify-center px-4
  bg-bg"
  >
    <Outlet />
  </div>
);
