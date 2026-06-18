import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Phone, MapPin, Edit2, ChevronRight } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();

  const userInfo = {
    name: "User Name",
    email: "user@example.com",
    phone: "+856 20 5555 1234",
    location: "Vientiane, Laos",
  };

  const stats = [
    { label: "Total Sessions", value: "42" },
    { label: "Total Energy", value: "1,234 kWh" },
    { label: "Member Since", value: "Jan 2025" },
  ];

  const menuItems = [
    { icon: User, label: "Personal Information", path: "/profile/edit" },
    { icon: MapPin, label: "Saved Addresses", path: "/profile/addresses" },
    { icon: Mail, label: "Notifications", path: "/profile/notifications" },
  ];

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-blue-600 px-6 pt-8 pb-12">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-2xl font-semibold">My Profile</h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="text-white" size={40} />
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl font-semibold mb-1">{userInfo.name}</h2>
              <p className="text-white/80 text-sm">{userInfo.email}</p>
            </div>
            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
              <Edit2 className="text-white" size={20} />
            </button>
          </div>

          <div className="space-y-2 text-white/90 text-sm">
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{userInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{userInfo.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 -mt-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {}}
              className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <item.icon className="text-slate-600" size={20} />
              </div>
              <span className="flex-1 text-left text-slate-900 font-medium">{item.label}</span>
              <ChevronRight className="text-slate-400" size={20} />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <button className="w-full mt-6 py-4 bg-white border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}
