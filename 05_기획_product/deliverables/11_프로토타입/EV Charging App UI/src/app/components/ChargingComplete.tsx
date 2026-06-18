import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, Clock, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export function ChargingComplete() {
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <CheckCircle2 className="text-orange-400 mx-auto mb-4" size={64} />
        </motion.div>
        <h1 className="text-white text-3xl mb-2">Charging Finished</h1>
        <p className="text-slate-300">Your vehicle is fully charged</p>
      </div>

      {/* Countdown Timer */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-6">
            <div className="text-orange-400 text-sm mb-2 flex items-center justify-center gap-2">
              <Clock size={16} />
              <span>Grace Period</span>
            </div>
          </div>

          {/* Timer Circle */}
          <motion.div
            className="relative inline-block"
            animate={{
              scale: countdown <= 60 ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: countdown <= 60 ? Infinity : 0,
            }}
          >
            <svg width="240" height="240" className="transform -rotate-90">
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke={countdown <= 60 ? "#ef4444" : "#f97316"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 100}
                strokeDashoffset={2 * Math.PI * 100 * (1 - countdown / 600)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-6xl font-mono font-bold">
                {timeDisplay}
              </div>
            </div>
          </motion.div>

          {/* Warning Message */}
          <div className="mt-8 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex gap-3">
              <AlertTriangle className="text-orange-400 flex-shrink-0 mt-1" size={24} />
              <div className="text-left">
                <p className="text-white mb-2">
                  Please move your vehicle immediately.
                </p>
                <p className="text-orange-200 text-sm">
                  An idle penalty of <span className="font-semibold">1,000 KIP/min</span> will
                  be applied after the timer ends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Summary */}
      <div className="px-6 pb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-white text-lg mb-4 flex items-center gap-2">
            <Zap className="text-orange-400" size={20} />
            Charging Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Energy Delivered</span>
              <span className="text-white font-semibold">28.5 kWh</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Charging Time</span>
              <span className="text-white font-semibold">47 mins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Rate</span>
              <span className="text-white font-semibold">4,000 KIP/kWh</span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between">
              <span className="text-white font-semibold">Total Cost</span>
              <span className="text-orange-400 text-xl font-bold">114,000 KIP</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/history")}
          className="w-full mt-4 bg-white text-slate-900 rounded-xl py-4 font-semibold hover:bg-slate-100 transition-colors active:scale-[0.98]"
        >
          View History
        </button>
      </div>
    </div>
  );
}
