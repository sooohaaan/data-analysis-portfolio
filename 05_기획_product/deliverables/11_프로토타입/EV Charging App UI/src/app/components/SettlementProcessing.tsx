import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, Calculator, Zap } from "lucide-react";

export function SettlementProcessing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate settlement calculation
    const timer = setTimeout(() => {
      navigate("/settlement-complete");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full bg-gradient-to-br from-orange-600 to-blue-600 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
          <div className="relative w-32 h-32 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
            <Calculator className="text-white" size={48} />
          </div>
        </div>

        {/* Loading Spinner */}
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-6" />

        {/* Message */}
        <h2 className="text-white text-2xl font-semibold mb-4">
          Processing Payment
        </h2>
        <p className="text-white/80 text-lg mb-2">
          Calculating final charges and
        </p>
        <p className="text-white/80 text-lg">
          generating receipt...
        </p>

        {/* Status Steps */}
        <div className="mt-8 space-y-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30 flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-white text-sm">Received final meter reading</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30 flex items-center gap-3">
            <Loader2 size={20} className="text-white animate-spin flex-shrink-0" />
            <span className="text-white text-sm">Calculating total cost...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
