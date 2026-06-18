import { Outlet, useNavigate, useLocation } from "react-router";
import { MapPin, Zap, History, Home, QrCode } from "lucide-react";
import { Toaster } from "sonner";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Map" },
    { path: "/qr-scan", icon: QrCode, label: "QR Scan" },
    { path: "/history", icon: History, label: "History" },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Toaster position="top-center" richColors />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
