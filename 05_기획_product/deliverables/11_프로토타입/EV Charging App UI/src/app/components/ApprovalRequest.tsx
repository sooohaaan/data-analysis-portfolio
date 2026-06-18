import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Loader2, Zap } from "lucide-react";

export function ApprovalRequest() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate approval process
    const timer = setTimeout(() => {
      navigate("/approval-success");
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
            <Zap className="text-white" size={48} fill="white" />
          </div>
        </div>

        {/* Loading Spinner */}
        <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-6" />

        {/* Message */}
        <h2 className="text-white text-2xl font-semibold mb-4">
          Requesting Approval
        </h2>
        <p className="text-white/80 text-lg mb-2">
          Processing payment authorization and
        </p>
        <p className="text-white/80 text-lg">
          connecting to charger...
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: "200ms" }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: "400ms" }} />
        </div>
      </div>
    </div>
  );
}
