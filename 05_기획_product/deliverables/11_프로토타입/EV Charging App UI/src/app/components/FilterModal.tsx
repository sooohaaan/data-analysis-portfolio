import { useState } from "react";
import { X, RotateCcw, Zap, Circle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const connectorTypes = [
  { id: "ac-slow", label: "AC완속", icon: "⚡" },
  { id: "dc-combo", label: "DC콤보", icon: "⚡⚡" },
  { id: "dc-chademo", label: "DC차데모", icon: "⚡⚡⚡" },
  { id: "ac-3phase", label: "AC3상", icon: "⚡⚡⚡⚡" },
  { id: "supercharger", label: "슈퍼차저", icon: "⚡" },
  { id: "destination", label: "데스티네이션", icon: "⚡" },
];

const powerLevels = [
  { id: "slow", label: "완속", icon: "⚡" },
  { id: "50kw", label: "50kW", icon: "⚡" },
  { id: "100kw", label: "100kW", icon: "⚡⚡" },
  { id: "200kw", label: "200kW", icon: "⚡⚡⚡" },
  { id: "300kw", label: "300kW +", icon: "⚡⚡⚡⚡" },
];

export function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const [selectedConnectors, setSelectedConnectors] = useState<Set<string>>(new Set());
  const [selectedPower, setSelectedPower] = useState<Set<string>>(new Set());
  const [rateRange, setRateRange] = useState([0, 600]);
  const [includeNoPrice, setIncludeNoPrice] = useState(false);

  const toggleConnector = (id: string) => {
    setSelectedConnectors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const togglePower = (id: string) => {
    setSelectedPower((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const resetFilters = () => {
    setSelectedConnectors(new Set());
    setSelectedPower(new Set());
    setRateRange([0, 600]);
    setIncludeNoPrice(false);
  };

  const applyFilters = () => {
    // Apply filters logic here
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={24} className="text-slate-700" />
            </button>
            <h2 className="text-lg font-semibold text-slate-900">필터</h2>
            <div className="w-10" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Charging Type */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-slate-900 mb-4">충전 타입</h3>
              <div className="grid grid-cols-3 gap-3">
                {connectorTypes.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => toggleConnector(connector.id)}
                    className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedConnectors.has(connector.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedConnectors.has(connector.id)
                          ? "bg-blue-100"
                          : "bg-white"
                      }`}
                    >
                      <Circle
                        size={24}
                        className={
                          selectedConnectors.has(connector.id)
                            ? "text-blue-500"
                            : "text-slate-400"
                        }
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        selectedConnectors.has(connector.id)
                          ? "text-blue-600"
                          : "text-slate-600"
                      }`}
                    >
                      {connector.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Charging Speed */}
            <div className="mb-8">
              <h3 className="text-base font-semibold text-slate-900 mb-4">충전 속도</h3>
              <div className="grid grid-cols-3 gap-3">
                {powerLevels.map((power) => (
                  <button
                    key={power.id}
                    onClick={() => togglePower(power.id)}
                    className={`aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedPower.has(power.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Zap
                      size={32}
                      className={
                        selectedPower.has(power.id) ? "text-blue-500" : "text-slate-400"
                      }
                    />
                    <span
                      className={`text-sm font-medium ${
                        selectedPower.has(power.id) ? "text-blue-600" : "text-slate-600"
                      }`}
                    >
                      {power.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Charging Rate */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">충전 요금</h3>
                <span className="text-sm text-slate-600">
                  {rateRange[0]} ~ {rateRange[1]}원/kWh
                </span>
              </div>

              <div className="relative pt-2 pb-8">
                <input
                  type="range"
                  min="0"
                  max="600"
                  value={rateRange[1]}
                  onChange={(e) => setRateRange([0, Number(e.target.value)])}
                  className="w-full h-2 bg-blue-500 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={includeNoPrice}
                    onChange={(e) => setIncludeNoPrice(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 border-2 border-slate-300 rounded-md peer-checked:bg-blue-500 peer-checked:border-blue-500 flex items-center justify-center">
                    {includeNoPrice && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-700">
                  가격정보가 없는 충전소 포함
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <RotateCcw size={20} />
              <span>초기화</span>
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 bg-blue-500 text-white rounded-xl py-4 font-semibold hover:bg-blue-600 transition-colors"
            >
              필터 저장하기
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
