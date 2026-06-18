import { useNavigate } from "react-router";
import { ArrowLeft, CreditCard, Wallet, Plus, ChevronRight, AlertTriangle } from "lucide-react";

export function Payment() {
  const navigate = useNavigate();
  const walletBalance = 60000;
  const minimumBalance = 20000;

  const paymentMethods = [
    { id: 1, type: "Credit Card", last4: "4242", brand: "Visa", isDefault: true },
    { id: 2, type: "Credit Card", last4: "5555", brand: "Mastercard", isDefault: false },
  ];

  const recentTransactions = [
    { id: 1, date: "2026-05-10", description: "Charging Session", amount: -114000, type: "debit" },
    { id: 2, date: "2026-05-09", description: "Wallet Top-up", amount: 200000, type: "credit" },
    { id: 3, date: "2026-05-08", description: "Charging Session", amount: -140800, type: "debit" },
  ];

  return (
    <div className="h-full bg-slate-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-600 to-blue-600 px-6 pt-8 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="text-white" size={24} />
          </button>
          <h1 className="text-white text-2xl font-semibold">Payment</h1>
        </div>

        {/* Wallet Balance */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="text-white" size={20} />
            <span className="text-white/80 text-sm">Wallet Balance</span>
            {walletBalance < minimumBalance && (
              <AlertTriangle className="text-orange-300" size={18} />
            )}
          </div>
          <div className="text-white text-4xl font-bold mb-4">
            {walletBalance.toLocaleString()} KIP
          </div>
          <button className="w-full bg-white text-orange-600 rounded-xl py-3 font-semibold hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
            <Plus size={20} />
            <span>Top Up Wallet</span>
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Payment Methods</h2>
          <button className="text-orange-600 text-sm font-semibold hover:text-orange-700">
            + Add New
          </button>
        </div>

        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white rounded-xl p-4 border-2 border-slate-200 hover:border-orange-500 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                    <CreditCard className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {method.brand} •••• {method.last4}
                    </div>
                    <div className="text-sm text-slate-500">{method.type}</div>
                  </div>
                </div>
                {method.isDefault && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">
                    Default
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Transactions</h2>
        <div className="bg-white rounded-xl overflow-hidden">
          {recentTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 ${
                index !== recentTransactions.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div>
                <div className="font-semibold text-slate-900">{transaction.description}</div>
                <div className="text-sm text-slate-500">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div
                className={`text-lg font-semibold ${
                  transaction.type === "credit" ? "text-orange-600" : "text-slate-900"
                }`}
              >
                {transaction.type === "credit" ? "+" : ""}
                {transaction.amount.toLocaleString()} KIP
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-3 text-orange-600 font-semibold hover:bg-orange-50 rounded-xl transition-colors flex items-center justify-center gap-2">
          <span>View All Transactions</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
