import { useNavigate } from "react-router";
import { X, MapPin, Zap, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: MapPin, label: "충전소 찾기", path: "/" },
  { icon: Zap, label: "충전", path: "/qr-scan" },
  { icon: History, label: "히스토리", path: "/history" },
];

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-8 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-700" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <item.icon className="text-slate-600" size={20} />
                  </div>
                  <span className="text-slate-900 font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                EV Charging App v1.0.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
