import { createBrowserRouter } from "react-router";
import { MapReserve } from "./components/MapReserve";
import { ActiveCharging } from "./components/ActiveCharging";
import { ChargingComplete } from "./components/ChargingComplete";
import { History } from "./components/History";
import { HistoryDetail } from "./components/HistoryDetail";
import { Layout } from "./components/Layout";
import { QRScanner } from "./components/QRScanner";
import { Payment } from "./components/Payment";
import { PaymentSelection } from "./components/PaymentSelection";
import { ApprovalRequest } from "./components/ApprovalRequest";
import { ApprovalSuccess } from "./components/ApprovalSuccess";
import { ChargingFinish } from "./components/ChargingFinish";
import { SettlementProcessing } from "./components/SettlementProcessing";
import { SettlementComplete } from "./components/SettlementComplete";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MapReserve },
      { path: "charging", Component: ActiveCharging },
      { path: "complete", Component: ChargingComplete },
      { path: "payment", Component: Payment },
    ],
  },
  {
    path: "/history",
    Component: Layout,
    children: [{ index: true, Component: History }],
  },
  {
    path: "/history/:id",
    Component: HistoryDetail,
  },
  {
    path: "/qr-scan",
    Component: QRScanner,
  },
  {
    path: "/payment-selection",
    Component: PaymentSelection,
  },
  {
    path: "/approval-request",
    Component: ApprovalRequest,
  },
  {
    path: "/approval-success",
    Component: ApprovalSuccess,
  },
  {
    path: "/charging-finish",
    Component: ChargingFinish,
  },
  {
    path: "/settlement-processing",
    Component: SettlementProcessing,
  },
  {
    path: "/settlement-complete",
    Component: SettlementComplete,
  },
]);
