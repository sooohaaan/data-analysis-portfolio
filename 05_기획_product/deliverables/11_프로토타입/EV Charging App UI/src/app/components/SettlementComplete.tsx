import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, BatteryCharging, Battery } from "lucide-react";

export function SettlementComplete() {
  const navigate = useNavigate();

  const sessionDetails = {
    evNumber: "EV 0001",
    chargerType: "120kW DC CCS",
    batteryPercent: 67,
    station: "Vientiane Mall Station",
    address: "128 Phonethong Road, Ban Nongduang, Sikhottabong District, Vientiane Capital, Laos",
    totalPayment: 88000,
    startTime: "08/05/2026, 12:45",
    finishTime: "08/05/2026, 13:14",
    duration: 50,
    totalEnergy: 31.09,
    idleFee: 5000,
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
        {/* Battery Status */}
        <div className="flex items-center gap-2 mb-6">
          <Battery className="text-yellow-500" size={20} />
          <span className="text-yellow-500 font-semibold">{sessionDetails.batteryPercent}%</span>
        </div>

        {/* EV Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
            <BatteryCharging className="text-white" size={24} />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{sessionDetails.evNumber}</div>
            <div className="text-sm text-slate-600">{sessionDetails.chargerType}</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-6">
          <MapPin className="text-slate-900 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-slate-700 leading-relaxed">
            {sessionDetails.address}
          </div>
        </div>

        {/* Total Payment */}
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Total payment</h2>
          <div className="text-xl font-semibold text-slate-900">
            K {sessionDetails.totalPayment.toLocaleString()}
          </div>
        </div>

        {/* Time Info */}
        <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Start</span>
            <span className="text-sm text-slate-900">{sessionDetails.startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Finish</span>
            <span className="text-sm text-slate-900">{sessionDetails.finishTime}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Payment information</h2>
          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-900">Duration</span>
              <span className="text-sm text-slate-900">{sessionDetails.duration} mins</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-900">Total energy</span>
              <span className="text-sm text-slate-900">{sessionDetails.totalEnergy} kWh</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-900">Idle fee</span>
              <span className="text-sm text-slate-900">K {sessionDetails.idleFee.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Indicator */}
      <div className="px-6 py-4 bg-white">
        <div className="flex justify-center">
          <div className="w-32 h-1 bg-slate-900 rounded-full" />
        </div>
      </div>
    </div>
  );
}
