import { useState } from "react";
import { X, Search, MapPin, Clock, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (stationId: number) => void;
}

const mockSearchResults = [
  { id: 1, name: "Vientiane Mall Station", address: "123 Chao Anouvong Rd", distance: 1.2, available: 2 },
  { id: 2, name: "Patuxai Fast Charge", address: "456 Lane Xang Ave", distance: 2.8, available: 3 },
  { id: 3, name: "That Luang SuperCharge", address: "789 That Luang Rd", distance: 0.5, available: 1 },
];

const recentSearches = [
  "Vientiane Mall Station",
  "Patuxai Fast Charge",
];

export function SearchModal({ isOpen, onClose, onSelectStation }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResults = searchQuery
    ? mockSearchResults.filter(
        (station) =>
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectStation = (stationId: number) => {
    onSelectStation(stationId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-white z-50 flex flex-col"
        >
          {/* Header */}
          <div className="px-4 pt-8 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-700" />
              </button>
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stations..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!searchQuery ? (
              <>
                {/* Recent Searches */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="text-slate-500" size={18} />
                    <h3 className="text-sm font-semibold text-slate-700">Recent Searches</h3>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setSearchQuery(search)}
                        className="w-full text-left px-4 py-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <span className="text-slate-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search Results */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    {filteredResults.length} Results
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.map((station) => (
                      <button
                        key={station.id}
                        onClick={() => handleSelectStation(station.id)}
                        className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{station.name}</h4>
                          <span className="text-sm text-orange-600 font-semibold">
                            {station.available} available
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{station.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Navigation size={14} />
                            <span>{station.distance} km</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
