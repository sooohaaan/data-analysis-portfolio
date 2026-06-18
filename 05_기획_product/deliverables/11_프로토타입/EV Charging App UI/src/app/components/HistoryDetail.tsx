import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, BatteryCharging, Battery } from "lucide-react";

const mockHistoryDetails = {
  "1": {
    id: 1,
    evNumber: "EV 0001",
    chargerType: "120kW DC CCS",
    batteryPercent: 67,
    station: "Vientiane Mall Station",
    address: "128 Phonethong Road, Ban Nongduang, Sikhottabong District, Vientiane Capital, Laos",
    totalPayment: 119000,
    startTime: "10/05/2026, 14:30",
    finishTime: "10/05/2026, 15:12",
    duration: 42,
    totalEnergy: 28.5,
    idleFee: 5000,
  },
  "2": {
    id: 2,
    evNumber: "EV 0002",
    chargerType: "100kW DC CCS",
    batteryPercent: 85,
    station: "Patuxai Fast Charge",
    address: "456 Lane Xang Ave, Vientiane Capital, Laos",
    totalPayment: 140800,
    startTime: "08/05/2026, 09:15",
    finishTime: "08/05/2026, 10:30",
    duration: 75,
    totalEnergy: 35.2,
    idleFee: 0,
  },
  "3": {
    id: 3,
    evNumber: "EV 0001",
    chargerType: "180kW DC CCS",
    batteryPercent: 92,
    station: "That Luang SuperCharge",
    address: "789 That Luang Rd, Vientiane Capital, Laos",
    totalPayment: 168400,
    startTime: "06/05/2026, 16:45",
    finishTime: "06/05/2026, 17:50",
    duration: 65,
    totalEnergy: 42.1,
    idleFee: 0,
  },
  "4": {
    id: 4,
    evNumber: "EV 0001",
    chargerType: "120kW DC CCS",
    batteryPercent: 72,
    station: "Vientiane Mall Station",
    address: "128 Phonethong Road, Ban Nongduang, Sikhottabong District, Vientiane Capital, Laos",
    totalPayment: 115200,
    startTime: "03/05/2026, 11:20",
    finishTime: "03/05/2026, 12:05",
    duration: 45,
    totalEnergy: 25.8,
    idleFee: 12000,
  },
  "5": {
    id: 5,
    evNumber: "EV 0002",
    chargerType: "150kW DC CCS",
    batteryPercent: 88,
    station: "Night Market Charging Hub",
    address: "Night Market Area, Vientiane Capital, Laos",
    totalPayment: 125600,
    startTime: "01/05/2026, 18:00",
    finishTime: "01/05/2026, 18:52",
    duration: 52,
    totalEnergy: 31.4,
    idleFee: 0,
  },
  "6": {
    id: 6,
    evNumber: "EV 0001",
    chargerType: "100kW DC CCS",
    batteryPercent: 78,
    station: "Patuxai Fast Charge",
    address: "456 Lane Xang Ave, Vientiane Capital, Laos",
    totalPayment: 157400,
    startTime: "28/04/2026, 13:30",
    finishTime: "28/04/2026, 14:35",
    duration: 65,
    totalEnergy: 38.6,
    idleFee: 3000,
  },
};

export function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const detail = mockHistoryDetails[id as keyof typeof mockHistoryDetails];

  if (!detail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-600">History not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
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
          <span className="text-yellow-500 font-semibold">{detail.batteryPercent}%</span>
        </div>

        {/* EV Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center">
            <BatteryCharging className="text-white" size={24} />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{detail.evNumber}</div>
            <div className="text-sm text-slate-600">{detail.chargerType}</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-6">
          <MapPin className="text-slate-900 flex-shrink-0 mt-1" size={20} />
          <div className="text-sm text-slate-700 leading-relaxed">
            {detail.address}
          </div>
        </div>

        {/* Total Payment */}
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Total payment</h2>
          <div className="text-xl font-semibold text-slate-900">
            K {detail.totalPayment.toLocaleString()}
          </div>
        </div>

        {/* Time Info */}
        <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Start</span>
            <span className="text-sm text-slate-900">{detail.startTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Finish</span>
            <span className="text-sm text-slate-900">{detail.finishTime}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Payment information</h2>
          <div className="bg-slate-50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-900">Duration</span>
              <span className="text-sm text-slate-900">{detail.duration} mins</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm text-slate-900">Total energy</span>
              <span className="text-sm text-slate-900">{detail.totalEnergy} kWh</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-slate-900">Idle fee</span>
              <span className="text-sm text-slate-900">K {detail.idleFee.toLocaleString()}</span>
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
