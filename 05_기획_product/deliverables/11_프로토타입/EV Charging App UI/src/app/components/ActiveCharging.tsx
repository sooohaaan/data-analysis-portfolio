import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Zap, Clock, Wallet, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export function ActiveCharging() {
  const [energy, setEnergy] = useState(18.5);
  const [chargingTime, setChargingTime] = useState(25);
  const [currentFee, setCurrentFee] = useState(74000);
  const [walletBalance, setWalletBalance] = useState(26000);
  const [progress, setProgress] = useState(62);
  const [slideProgress, setSlideProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 0.1, 30));
      setChargingTime((prev) => prev + 1);
      setCurrentFee((prev) => prev + 4000);
      setWalletBalance((prev) => Math.max(prev - 4000, 0));
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSlideComplete = () => {
    if (slideProgress > 85) {
      navigate("/charging-finish");
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-900 to-orange-900 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 text-center">
        <h1 className="text-orange-400 text-3xl font-bold mb-2">Charging Safely</h1>
        <p className="text-white/80 text-sm">Vientiane Mall Station</p>
      </div>

      {/* Circular Progress */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative">
          {/* Background Circle */}
          <svg width="280" height="280" className="transform -rotate-90">
            <circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="12"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="140"
              cy="140"
              r="120"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Zap className="text-orange-400 mb-3" size={36} fill="currentColor" />
            <div className="text-white text-5xl font-semibold mb-1">
              {energy.toFixed(1)}
            </div>
            <div className="text-orange-400 text-lg">kWh</div>
            <div className="text-slate-400 text-sm mt-2">{progress}%</div>
            <div className="text-white/60 text-xs mt-1">Battery Level</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-cyan-400" size={16} />
              <div className="text-xs text-slate-300">Time</div>
            </div>
            <div className="text-white text-lg font-semibold">{chargingTime}</div>
            <div className="text-xs text-slate-400">mins</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-orange-400" size={16} />
              <div className="text-xs text-slate-300">Fee</div>
            </div>
            <div className="text-white text-lg font-semibold">
              {(currentFee / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-slate-400">KIP</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="text-purple-400" size={16} />
              <div className="text-xs text-slate-300">Balance</div>
            </div>
            <div className="text-white text-lg font-semibold">
              {(walletBalance / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-slate-400">KIP</div>
          </div>
        </div>

        {/* Slide to Stop */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
            style={{ width: `${Math.max(slideProgress, 15)}%` }}
          />
          <div className="relative flex items-center justify-center py-4">
            <input
              type="range"
              min="0"
              max="100"
              value={slideProgress}
              onChange={(e) => setSlideProgress(Number(e.target.value))}
              onMouseUp={handleSlideComplete}
              onTouchEnd={handleSlideComplete}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center gap-2 text-white font-semibold pointer-events-none">
              <span>Slide to Stop Charging</span>
              <ArrowRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
