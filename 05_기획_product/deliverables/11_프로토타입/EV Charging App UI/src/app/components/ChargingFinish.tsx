import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, Zap, Unplug } from "lucide-react";

export function ChargingFinish() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate connector unlock process
    const timer = setTimeout(() => {
      navigate("/settlement-processing");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-orange-900 flex flex-col items-center justify-center px-6">
      {/* Semi-transparent overlay effect */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative text-center z-10">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse" />
          <div className="relative w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
            <Unplug className="text-white" size={48} />
          </div>
        </div>

        {/* Loading Spinner */}
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-6" />

        {/* Message */}
        <h2 className="text-white text-2xl font-semibold mb-4">
          Charging Complete!
        </h2>
        <p className="text-white/80 text-lg mb-2">
          Disconnecting power and
        </p>
        <p className="text-white/80 text-lg">
          unlocking connector...
        </p>

        {/* Progress Indicator */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-center gap-2 text-white/90">
            <Zap size={20} className="text-orange-400" />
            <span className="text-sm">Please wait while we finalize your session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
