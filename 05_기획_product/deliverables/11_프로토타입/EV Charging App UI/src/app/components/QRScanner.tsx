import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, Zap, Flashlight } from "lucide-react";
import { motion } from "motion/react";

export function QRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    // Simulate QR scan success after 3 seconds
    const timer = setTimeout(() => {
      setScanning(false);
      setTimeout(() => {
        navigate("/payment-selection");
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-white text-2xl">Scan QR Code</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="relative w-full max-w-sm aspect-square">
          {/* Camera viewfinder simulation */}
          <div className="absolute inset-0 bg-slate-800 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />

            {/* Scanning frame */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative w-64 h-64">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />

                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-orange-400 shadow-lg shadow-orange-400/50"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <svg width="100%" height="100%" className="opacity-20">
              <defs>
                <pattern id="qr-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#qr-grid)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Flash Button */}
      <div className="flex justify-center pb-6">
        <button
          onClick={() => setFlashOn(!flashOn)}
          className={`p-4 rounded-full transition-all ${
            flashOn
              ? "bg-orange-500 text-white"
              : "bg-white/10 backdrop-blur-sm text-white border border-white/20"
          }`}
        >
          <Flashlight size={24} />
        </button>
      </div>

      {/* Instructions */}
      <div className="px-6 pb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <Zap className="text-orange-400 mx-auto mb-3" size={32} />
          {scanning ? (
            <>
              <p className="text-white mb-2">Position the QR code within the frame</p>
              <p className="text-slate-400 text-sm">
                Find the QR code on your charging connector
              </p>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <p className="text-orange-400 text-xl font-semibold mb-2">QR Code Detected!</p>
              <p className="text-white text-sm">
                Redirecting to payment...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
