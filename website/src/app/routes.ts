import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import DashboardDemo from "./pages/DashboardDemo";
import Download from "./pages/Download";
import ErrorPage from "./pages/ErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/download",
    Component: Download,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/how-it-works",
    Component: HowItWorks,
  },
  {
    path: "/pricing",
    Component: Pricing,
  },
  {
    path: "/dashboard-demo",
    Component: DashboardDemo,
  },
  {
    path: "*",
    Component: ErrorPage,
  },
]);
