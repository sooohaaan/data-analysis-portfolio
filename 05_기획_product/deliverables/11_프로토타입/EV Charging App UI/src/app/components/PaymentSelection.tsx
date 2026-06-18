import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Wallet, RefreshCw, AlertCircle, Zap, BatteryCharging } from "lucide-react";

export function PaymentSelection() {
  const navigate = useNavigate();
  const [walletBalance] = useState(200000);

  const minimumBalance = 100000;
  const hasEnoughBalance = walletBalance >= minimumBalance;
  const additionalRequired = minimumBalance - walletBalance;

  const handleStartCharging = () => {
    if (!hasEnoughBalance) {
      return;
    }
    navigate("/approval-request");
  };

  const handleTopUp = () => {
    navigate("/payment");
  };

  const handleRefreshBalance = () => {
    // Refresh balance logic
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-slate-900" size={24} />
          </button>
          <h1 className="text-slate-900 text-lg font-semibold">충전</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* EV Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
            <BatteryCharging className="text-white" size={24} />
          </div>
          <div>
            <div className="font-semibold text-slate-900">EV 0001</div>
            <div className="text-sm text-slate-600">120kW DC CCS</div>
          </div>
        </div>

        {/* Price Section */}
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Price</h2>
          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Fee per kWh</span>
              <span className="text-sm text-slate-900 font-medium">K 4,200</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Duration fee per 1 min</span>
              <span className="text-sm text-slate-900 font-medium">K 330</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Connection fee</span>
              <span className="text-sm text-slate-900 font-medium">K 7,000</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Duration fee grace period</span>
              <span className="text-sm text-slate-900 font-medium">4 mins</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-600">Idle fee grace period (min)</span>
              <span className="text-sm text-slate-900 font-medium">7 mins</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-600">Idle fee per min</span>
              <span className="text-sm text-slate-900 font-medium">K 1,000</span>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-yellow-800">
            Minimum K 100,000 required to start charging.
          </div>
        </div>

        {/* Wallet Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Wallet className="text-white" size={14} />
              </div>
              <span className="font-semibold text-slate-900">Wallet</span>
            </div>
            <button
              onClick={handleTopUp}
              className="text-orange-600 font-medium text-sm hover:text-orange-700 transition-colors"
            >
              Top up
            </button>
          </div>

          {/* Balance */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-slate-600">Balance</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-900 font-medium">
                K {walletBalance.toLocaleString()}
              </span>
              <button
                onClick={handleRefreshBalance}
                className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <RefreshCw className="text-slate-600" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Start Charging Button */}
      <div className="px-6 py-4 bg-white">
        <button
          onClick={handleStartCharging}
          disabled={!hasEnoughBalance}
          className={`w-full rounded-xl py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
            !hasEnoughBalance
              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.98]"
          }`}
        >
          <BatteryCharging size={20} />
          <span>Start charging</span>
        </button>

        {/* Insufficient Balance Message */}
        {!hasEnoughBalance && (
          <div className="mt-3 text-center text-sm text-slate-600">
            An additional ₭ {additionalRequired.toLocaleString()} is required to start charging.
          </div>
        )}

        {/* Bottom Indicator */}
        <div className="flex justify-center mt-4">
          <div className="w-32 h-1 bg-slate-900 rounded-full" />
        </div>
      </div>
    </div>
  );
}
