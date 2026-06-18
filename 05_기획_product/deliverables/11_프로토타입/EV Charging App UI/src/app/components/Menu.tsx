import { useNavigate } from "react-router";
import { MapPin, Zap, History } from "lucide-react";

export function Menu() {
  const navigate = useNavigate();

  const menuButtons = [
    {
      id: "find-stations",
      icon: MapPin,
      label: "충전소 찾기",
      description: "가까운 충전소를 찾아보세요",
      path: "/",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-500/30",
      hoverShadow: "hover:shadow-blue-500/40",
    },
    {
      id: "charge",
      icon: Zap,
      label: "충전",
      description: "QR 코드를 스캔하여 충전을 시작하세요",
      path: "/qr-scan",
      gradient: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-500/30",
      hoverShadow: "hover:shadow-orange-500/40",
    },
    {
      id: "history",
      icon: History,
      label: "히스토리",
      description: "충전 내역을 확인하세요",
      path: "/history",
      gradient: "from-slate-600 to-slate-700",
      shadow: "shadow-slate-600/30",
      hoverShadow: "hover:shadow-slate-600/40",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
          <Zap size={40} className="text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">EV Charging</h1>
        <p className="text-slate-600">빠르고 편리한 전기차 충전 서비스</p>
      </div>

      {/* Menu Buttons */}
      <div className="w-full max-w-md space-y-4">
        {menuButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => navigate(button.path)}
            className={`w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-98 border-2 border-transparent hover:border-orange-200 group`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${button.gradient} rounded-2xl flex items-center justify-center shadow-lg ${button.shadow} ${button.hoverShadow} group-hover:scale-110 transition-all`}
              >
                <button.icon size={32} className="text-white" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-xl font-semibold text-slate-900 mb-1">
                  {button.label}
                </div>
                <div className="text-sm text-slate-600">{button.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-500">EV Charging App v1.0.0</p>
      </div>
    </div>
  );
}
