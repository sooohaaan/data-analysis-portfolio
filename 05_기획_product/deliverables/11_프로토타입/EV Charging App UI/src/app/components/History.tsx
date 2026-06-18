import { ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

const mockHistory = [
  {
    id: 1,
    date: "2026-05-10",
    time: "14:30",
    station: "Vientiane Mall Station",
    evNumber: "EV 0001",
    chargerType: "120kW DC CCS",
    energy: 28.5,
    cost: 114000,
    idlePenalty: 5000,
  },
  {
    id: 2,
    date: "2026-05-08",
    time: "09:15",
    station: "Patuxai Fast Charge",
    evNumber: "EV 0002",
    chargerType: "100kW DC CCS",
    energy: 35.2,
    cost: 140800,
    idlePenalty: 0,
  },
  {
    id: 3,
    date: "2026-05-06",
    time: "16:45",
    station: "That Luang SuperCharge",
    evNumber: "EV 0001",
    chargerType: "180kW DC CCS",
    energy: 42.1,
    cost: 168400,
    idlePenalty: 0,
  },
  {
    id: 4,
    date: "2026-05-03",
    time: "11:20",
    station: "Vientiane Mall Station",
    evNumber: "EV 0001",
    chargerType: "120kW DC CCS",
    energy: 25.8,
    cost: 103200,
    idlePenalty: 12000,
  },
  {
    id: 5,
    date: "2026-05-01",
    time: "18:00",
    station: "Night Market Charging Hub",
    evNumber: "EV 0002",
    chargerType: "150kW DC CCS",
    energy: 31.4,
    cost: 125600,
    idlePenalty: 0,
  },
  {
    id: 6,
    date: "2026-04-28",
    time: "13:30",
    station: "Patuxai Fast Charge",
    evNumber: "EV 0001",
    chargerType: "100kW DC CCS",
    energy: 38.6,
    cost: 154400,
    idlePenalty: 3000,
  },
];

// Group by month
const groupedHistory = mockHistory.reduce((acc, session) => {
  const date = new Date(session.date);
  const monthKey = date.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  if (!acc[monthKey]) {
    acc[monthKey] = [];
  }
  acc[monthKey].push(session);
  return acc;
}, {} as Record<string, typeof mockHistory>);

export function History() {
  const navigate = useNavigate();

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

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([month, sessions]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-slate-500 mb-3">{month}</h2>

              <div className="space-y-3">
                {sessions.map((session) => {
                  const totalCost = session.cost + session.idlePenalty;
                  const formattedDate = new Date(session.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/history/${session.id}`)}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-slate-900 mb-1">
                            {session.evNumber}
                          </div>
                          <div className="text-sm text-slate-600">
                            {session.chargerType}
                          </div>
                        </div>
                        <ChevronRight className="text-slate-400" size={20} />
                      </div>

                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">{session.station}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          {formattedDate}, {session.time}
                        </span>
                        <span className="font-semibold text-slate-900">
                          K {totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
