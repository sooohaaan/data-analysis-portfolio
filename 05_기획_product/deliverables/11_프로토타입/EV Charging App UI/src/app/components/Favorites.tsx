import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Navigation, Zap, Trash2 } from "lucide-react";
import { toast } from "sonner";

const mockStations = [
  {
    id: 1,
    name: "Vientiane Mall Station",
    chargerNumber: "VMC-001",
    address: "123 Chao Anouvong Rd, Vientiane Capital, Laos",
    distance: 1.2,
    available: 2,
    total: 2,
  },
  {
    id: 2,
    name: "Patuxai Fast Charge",
    chargerNumber: "PFC-002",
    address: "456 Lane Xang Ave, Vientiane Capital, Laos",
    distance: 2.8,
    available: 1,
    total: 2,
  },
  {
    id: 3,
    name: "That Luang SuperCharge",
    chargerNumber: "TLS-003",
    address: "789 That Luang Rd, Vientiane Capital, Laos",
    distance: 0.5,
    available: 1,
    total: 2,
  },
];

export function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load favorites from localStorage
    const stored = localStorage.getItem("favorites");
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  const favoriteStations = mockStations.filter((station) => favorites.has(station.id));

  const handleRemove = (id: number, name: string) => {
    const newFavorites = new Set(favorites);
    newFavorites.delete(id);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(Array.from(newFavorites)));
    toast.success(`${name} removed from favorites`);
  };

  const handleViewOnMap = (id: number) => {
    // Store selected station ID in localStorage
    localStorage.setItem("selectedStationId", id.toString());
    navigate("/");
    toast.success("Showing station on map");
  };

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-blue-600 px-6 pt-8 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-2xl font-semibold">Favorites</h1>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
          <div className="text-white/80 text-sm mb-1">Total Favorites</div>
          <div className="text-white text-3xl font-bold">{favoriteStations.length}</div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="px-6 py-6">
        {favoriteStations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-slate-400" size={40} />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Favorites Yet</h3>
            <p className="text-slate-500 text-sm">
              Add charging stations to your favorites for quick access
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteStations.map((station) => (
              <div
                key={station.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-orange-500 transition-all"
              >
                <div
                  onClick={() => handleViewOnMap(station.id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{station.name}</h3>
                      <div className="inline-block bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 mb-2">
                        <span className="text-xs font-semibold text-blue-700">
                          {station.chargerNumber}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        station.available > 0
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {station.available > 0 ? "Available" : "In Use"}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Navigation size={14} />
                      <span>{station.distance} km</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-orange-600" />
                      <span>
                        <span className="text-orange-600 font-semibold">
                          {station.available}
                        </span>
                        /{station.total}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-sm text-slate-500">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{station.address}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(station.id, station.name);
                    }}
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm font-semibold">Remove from Favorites</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
