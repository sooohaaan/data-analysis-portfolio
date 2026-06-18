import { useEffect } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Zap } from "lucide-react";
import { motion } from "motion/react";

export function ApprovalSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/charging");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full bg-gradient-to-br from-orange-600 to-blue-600 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="mb-8"
        >
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            <div className="relative w-32 h-32 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
              <CheckCircle2 className="text-white" size={64} />
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-white text-3xl font-bold mb-4">
            Approved!
          </h2>
          <p className="text-white/90 text-lg mb-2">
            Payment authorized successfully
          </p>
          <p className="text-white/80 text-base">
            Connecting to charger...
          </p>
        </motion.div>

        {/* Charger Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
        >
          <div className="flex items-center justify-center gap-2 text-white">
            <Zap size={20} fill="white" />
            <span className="font-semibold">Starting charging session...</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
