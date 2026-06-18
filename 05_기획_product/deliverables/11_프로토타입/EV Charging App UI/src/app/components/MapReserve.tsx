import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Zap, QrCode, Clock, ChevronRight, X, ArrowLeft, Menu, MapPin, Filter, Locate } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { FilterModal } from "./FilterModal";
import { SearchModal } from "./SearchModal";
import { MenuDrawer } from "./MenuDrawer";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { Drawer } from "vaul";

const mockStations = [
  {
    id: 1,
    name: "Vientiane Mall Station",
    chargerNumber: "VMC-001",
    address: "123 Chao Anouvong Rd, Vientiane Capital, Laos",
    distance: 1.2,
    available: 2,
    total: 2,
    lat: 35,
    lng: 30,
    isOperational: true,
    connectors: [
      { id: 1, evNumber: "EV 0001", type: "DC Combo", standard: "CCS2", status: "Available", power: "150kW", powerConsumption: "120Wh", estimatedTime: "4 hours", serialNumber: "CCS2-VMC-001-A" },
      { id: 2, evNumber: "EV 0002", type: "DC CHAdeMO", standard: "GB/T", status: "Available", power: "100kW", powerConsumption: "80Wh", estimatedTime: "5 hours", serialNumber: "GBT-VMC-001-B" }
    ],
    rates: {
      standard: "CCS2 / GB/T",
      output: "150kW DC",
      perKwh: 4000,
      perMinute: 1000,
      connectionFee: 7000,
      durationFeeGracePeriod: 4,
      idleFeeGracePeriod: 10,
      idleFeePerMinute: 1000
    },
    operatingHours: "24/7",
    photos: ["station1.jpg", "station2.jpg"]
  },
  {
    id: 2,
    name: "Patuxai Fast Charge",
    chargerNumber: "PFC-002",
    address: "456 Lane Xang Ave, Vientiane Capital, Laos",
    distance: 2.8,
    available: 1,
    total: 2,
    lat: 50,
    lng: 25,
    isOperational: true,
    connectors: [
      { id: 1, evNumber: "EV 0001", type: "DC Combo", standard: "CCS2", status: "In Use", power: "120kW", powerConsumption: "120Wh", estimatedTime: "4 hours", serialNumber: "CCS2-PFC-002-A" },
      { id: 2, evNumber: "EV 0002", type: "DC CHAdeMO", standard: "GB/T", status: "Unavailable", power: "60kW", powerConsumption: "60Wh", estimatedTime: "6 hours", serialNumber: "GBT-PFC-002-B" }
    ],
    rates: {
      standard: "CCS2 / GB/T",
      output: "120kW DC",
      perKwh: 4000,
      perMinute: 1000,
      connectionFee: 7000,
      durationFeeGracePeriod: 4,
      idleFeeGracePeriod: 10,
      idleFeePerMinute: 1000
    },
    operatingHours: "06:00 - 22:00",
    photos: ["station1.jpg"]
  },
  {
    id: 3,
    name: "That Luang SuperCharge",
    chargerNumber: "TLS-003",
    address: "789 That Luang Rd, Vientiane Capital, Laos",
    distance: 0.5,
    available: 1,
    total: 2,
    lat: 30,
    lng: 45,
    isOperational: true,
    connectors: [
      { id: 1, evNumber: "EV 0001", type: "DC Combo", standard: "CCS2", status: "Available", power: "180kW", powerConsumption: "150Wh", estimatedTime: "3 hours", serialNumber: "CCS2-TLS-003-A" },
      { id: 2, evNumber: "EV 0002", type: "DC CHAdeMO", standard: "GB/T", status: "In Use", power: "80kW", powerConsumption: "80Wh", estimatedTime: "5 hours", serialNumber: "GBT-TLS-003-B" }
    ],
    rates: {
      standard: "CCS2 / GB/T",
      output: "180kW DC",
      perKwh: 4000,
      perMinute: 1000,
      connectionFee: 7000,
      durationFeeGracePeriod: 4,
      idleFeeGracePeriod: 10,
      idleFeePerMinute: 1000
    },
    operatingHours: "24/7",
    photos: ["station1.jpg", "station2.jpg", "station3.jpg"]
  },
  {
    id: 4,
    name: "Lao Plaza Hotel Station",
    chargerNumber: "LPH-004",
    address: "789 Samsenthai Rd, Vientiane Capital, Laos",
    distance: 3.5,
    available: 0,
    total: 4,
    lat: 55,
    lng: 50,
    isOperational: false,
    connectors: [
      { id: 1, evNumber: "EV 0001", type: "DC Combo", standard: "CCS2", status: "Unavailable", power: "100kW", powerConsumption: "100Wh", estimatedTime: "4 hours", serialNumber: "CCS2-LPH-004-A" },
      { id: 2, evNumber: "EV 0002", type: "DC CHAdeMO", standard: "GB/T", status: "Unavailable", power: "60kW", powerConsumption: "60Wh", estimatedTime: "6 hours", serialNumber: "GBT-LPH-004-B" },
      { id: 3, evNumber: "EV 0003", type: "DC Combo", standard: "CCS2", status: "Unavailable", power: "100kW", powerConsumption: "100Wh", estimatedTime: "4 hours", serialNumber: "CCS2-LPH-004-C" },
      { id: 4, evNumber: "EV 0004", type: "DC CHAdeMO", standard: "GB/T", status: "Unavailable", power: "60kW", powerConsumption: "60Wh", estimatedTime: "6 hours", serialNumber: "GBT-LPH-004-D" }
    ],
    rates: {
      standard: "CCS2 / GB/T",
      output: "100kW DC",
      perKwh: 4000,
      perMinute: 1000,
      connectionFee: 7000,
      durationFeeGracePeriod: 4,
      idleFeeGracePeriod: 10,
      idleFeePerMinute: 1000
    },
    operatingHours: "Temporarily Closed",
    photos: ["station1.jpg"]
  },
  {
    id: 5,
    name: "Morning Market Station",
    chargerNumber: "MMS-005",
    address: "456 Talat Sao Rd, Vientiane Capital, Laos",
    distance: 2.1,
    available: 1,
    total: 4,
    lat: 45,
    lng: 60,
    isOperational: true,
    connectors: [
      { id: 1, evNumber: "EV 0001", type: "DC Combo", standard: "CCS2", status: "Available", power: "150kW", powerConsumption: "120Wh", estimatedTime: "4 hours", serialNumber: "CCS2-MMS-005-A" },
      { id: 2, evNumber: "EV 0002", type: "DC CHAdeMO", standard: "GB/T", status: "In Use", power: "100kW", powerConsumption: "100Wh", estimatedTime: "4 hours", serialNumber: "GBT-MMS-005-B" },
      { id: 3, evNumber: "EV 0003", type: "DC Combo", standard: "CCS2", status: "In Use", power: "150kW", powerConsumption: "120Wh", estimatedTime: "4 hours", serialNumber: "CCS2-MMS-005-C" },
      { id: 4, evNumber: "EV 0004", type: "DC CHAdeMO", standard: "GB/T", status: "In Use", power: "100kW", powerConsumption: "100Wh", estimatedTime: "4 hours", serialNumber: "GBT-MMS-005-D" }
    ],
    rates: {
      standard: "CCS2 / GB/T",
      output: "150kW DC",
      perKwh: 4000,
      perMinute: 1000,
      connectionFee: 7000,
      durationFeeGracePeriod: 4,
      idleFeeGracePeriod: 10,
      idleFeePerMinute: 1000
    },
    operatingHours: "05:00 - 23:00",
    photos: ["station1.jpg", "station2.jpg"]
  },
];

export function MapReserve() {
  const [selectedStation, setSelectedStation] = useState<typeof mockStations[0] | null>(null);
  const [walletBalance] = useState(60000);
  const minimumBalance = 20000;
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilterSheet, setActiveFilterSheet] = useState<"connector" | "power" | "availability" | null>(null);
  const [selectedConnectors, setSelectedConnectors] = useState<Set<string>>(new Set());
  const [selectedPower, setSelectedPower] = useState<Set<string>>(new Set());
  const [selectedAvailability, setSelectedAvailability] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // Load selected station from localStorage on mount
  useEffect(() => {
    const selectedStationId = localStorage.getItem("selectedStationId");
    if (selectedStationId) {
      const station = mockStations.find((s) => s.id === Number(selectedStationId));
      if (station) {
        setSelectedStation(station);
        localStorage.removeItem("selectedStationId");
      }
    }
  }, []);

  const handleReserve = () => {
    navigate("/charging");
  };

  const handleQRScan = () => {
    navigate("/qr-scan");
  };

  const handleSelectStation = (stationId: number) => {
    const station = mockStations.find((s) => s.id === stationId);
    if (station) {
      setSelectedStation(station);
    }
  };

  const handleGoToCurrentLocation = () => {
    toast.success("Moving to your current location");
    // In a real app, this would center the map on user's GPS coordinates
  };

  const connectorOptions = [
    { id: "available", label: "Available" },
    { id: "in-use", label: "In Use" },
    { id: "out-of-order", label: "Out of Order" },
  ];

  const powerOptions = [
    { id: "50kw", label: "50kW" },
    { id: "100kw", label: "100kW" },
    { id: "150kw", label: "150kW" },
    { id: "200kw", label: "200kW" },
    { id: "300kw", label: "300kW+" },
  ];

  const availabilityOptions = [
    { id: "all", label: "All Connectors" },
    { id: "dc-combo", label: "DC Combo" },
    { id: "chademo", label: "CHAdeMO" },
    { id: "ac-3phase", label: "AC 3-Phase" },
    { id: "ac-slow", label: "AC Slow" },
  ];

  const handleApplyFilter = () => {
    setActiveFilterSheet(null);
    toast.success("Filters applied");
  };

  const handleResetFilter = () => {
    if (activeFilterSheet === "connector") setSelectedConnectors(new Set());
    if (activeFilterSheet === "power") setSelectedPower(new Set());
    if (activeFilterSheet === "availability") setSelectedAvailability(new Set());
  };

  const getFilterLabel = (type: "connector" | "power" | "availability") => {
    if (type === "connector") {
      return selectedConnectors.size > 0
        ? `${selectedConnectors.size} selected`
        : "Status";
    }
    if (type === "power") {
      return selectedPower.size > 0 ? `${selectedPower.size} selected` : "200kW";
    }
    if (type === "availability") {
      return selectedAvailability.size > 0
        ? `${selectedAvailability.size} selected`
        : "All Connectors";
    }
    return "";
  };

  const filteredStations = mockStations;

  return (
    <div className="relative h-full">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-orange-50 to-blue-50">
        {/* Simplified Map Grid */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-400" />
          </svg>
        </div>

        {/* Map Pins */}
        {filteredStations.map((station) => {
          const pinColor = !station.isOperational
            ? "bg-red-500"
            : station.available > 0
            ? "bg-slate-800"
            : "bg-slate-400";

          return (
            <motion.button
              key={station.id}
              onClick={() => handleSelectStation(station.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                selectedStation?.id === station.id ? "z-20" : "z-10"
              }`}
              style={{ top: `${station.lat}%`, left: `${station.lng}%` }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div
                className={`relative transition-all ${
                  selectedStation?.id === station.id ? "scale-125" : ""
                }`}
              >
                {/* Circular Pin */}
                <div className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center ${pinColor} border-3 border-white`}>
                  <Zap className="text-white" size={20} fill="white" />
                </div>
              </div>
            </motion.button>
          );
        })}

        {/* User Location */}
        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      </div>

      {/* Top Unified Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-30">
        <div className="bg-white shadow-lg rounded-xl px-3 py-3">
          {/* Top Row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={24} className="text-slate-700" />
            </button>

            {/* Search Input */}
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex-1 bg-slate-100 rounded-lg px-4 py-2 flex items-center gap-2 min-w-0"
            >
              <MapPin size={18} className="text-slate-600 flex-shrink-0" />
              <span className="text-sm text-slate-600 truncate">Search stations...</span>
            </button>

            {/* Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu size={24} className="text-slate-700" />
            </button>
          </div>

          {/* Filter Chips Row */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500 flex-shrink-0" />
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveFilterSheet("connector")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap transition-colors"
              >
                {getFilterLabel("connector")}
              </button>
              <button
                onClick={() => setActiveFilterSheet("power")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap transition-colors"
              >
                {getFilterLabel("power")}
              </button>
              <button
                onClick={() => setActiveFilterSheet("availability")}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-medium text-slate-700 whitespace-nowrap transition-colors"
              >
                {getFilterLabel("availability")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right Floating Buttons */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-3">
        <button
          onClick={handleGoToCurrentLocation}
          className="bg-white shadow-lg rounded-full p-4 hover:bg-orange-50 active:scale-95 transition-all"
        >
          <Locate size={24} className="text-orange-600" />
        </button>

        <button
          onClick={handleQRScan}
          className="bg-orange-600 shadow-lg shadow-orange-500/30 rounded-full p-4 hover:bg-orange-700 active:scale-95 transition-all"
        >
          <QrCode size={24} className="text-white" />
        </button>
      </div>

      {/* Bottom Sheet */}
      <Drawer.Root open={!!selectedStation} dismissible={true} onOpenChange={(open) => !open && setSelectedStation(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-30" />
          <Drawer.Content className="bg-white flex flex-col rounded-t-3xl h-[85vh] fixed bottom-0 left-0 right-0 z-40">
            {/* Handle */}
            <div className="px-6 pt-4 pb-2">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <Drawer.Title className="text-xl font-semibold text-slate-900">
                  Details
                </Drawer.Title>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>
              <Drawer.Description className="sr-only">
                Charging station details
              </Drawer.Description>
            </div>

            {/* Content */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
              {/* Address */}
              <div className="mb-6">
                <p className="text-sm text-slate-700">{selectedStation?.address}</p>
              </div>

              {/* Connectors */}
              <div className="space-y-3 mb-6">
                {selectedStation?.connectors.map((connector) => {
                  const isAvailable = connector.status === "Available";

                  return (
                    <div
                      key={connector.id}
                      onClick={() => navigate("/payment-selection")}
                      className="flex items-start justify-between py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-2">
                          {connector.evNumber}
                        </div>
                        <div className={`inline-block px-3 py-1 rounded text-xs font-semibold mb-3 ${
                          isAvailable
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {connector.status}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Zap size={14} className="text-slate-500" />
                            <span>{connector.powerConsumption}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-500" />
                            <span>{connector.estimatedTime} (Expected)</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white">
              <button
                onClick={handleQRScan}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl py-4 font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <QrCode size={20} />
                <span>Scan</span>
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Filter Modal */}
      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStation={handleSelectStation}
      />

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Filter Bottom Sheets */}
      <FilterBottomSheet
        isOpen={activeFilterSheet === "connector"}
        onClose={() => setActiveFilterSheet(null)}
        title="Charger Status"
        options={connectorOptions}
        selectedOptions={selectedConnectors}
        onSelectionChange={setSelectedConnectors}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      <FilterBottomSheet
        isOpen={activeFilterSheet === "power"}
        onClose={() => setActiveFilterSheet(null)}
        title="Power Output"
        options={powerOptions}
        selectedOptions={selectedPower}
        onSelectionChange={setSelectedPower}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      <FilterBottomSheet
        isOpen={activeFilterSheet === "availability"}
        onClose={() => setActiveFilterSheet(null)}
        title="Connector Type"
        options={availabilityOptions}
        selectedOptions={selectedAvailability}
        onSelectionChange={setSelectedAvailability}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectStation={handleSelectStation}
      />

      {/* Menu Drawer */}
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Filter Bottom Sheets */}
      <FilterBottomSheet
        isOpen={activeFilterSheet === "connector"}
        onClose={() => setActiveFilterSheet(null)}
        title="Charger Status"
        options={connectorOptions}
        selectedOptions={selectedConnectors}
        onSelectionChange={setSelectedConnectors}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      <FilterBottomSheet
        isOpen={activeFilterSheet === "power"}
        onClose={() => setActiveFilterSheet(null)}
        title="Power Output"
        options={powerOptions}
        selectedOptions={selectedPower}
        onSelectionChange={setSelectedPower}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />

      <FilterBottomSheet
        isOpen={activeFilterSheet === "availability"}
        onClose={() => setActiveFilterSheet(null)}
        title="Connector Type"
        options={availabilityOptions}
        selectedOptions={selectedAvailability}
        onSelectionChange={setSelectedAvailability}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
      />
    </div>
  );
}
