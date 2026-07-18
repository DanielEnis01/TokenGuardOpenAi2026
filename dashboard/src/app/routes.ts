import { createHashRouter } from "react-router";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Monitor from "./pages/Monitor";
import Guardrails from "./pages/Guardrails";
import History from "./pages/History";
import Tools from "./pages/Tools";
import Settings from "./pages/Settings";
import ErrorPage from "./pages/ErrorPage";

export const router = createHashRouter([
  {
    path: "/",
    Component: Auth,
  },
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/onboarding",
    Component: Onboarding,
  },
  {
    path: "/monitor",
    Component: Monitor,
  },
  {
    path: "/guardrails",
    Component: Guardrails,
  },
  {
    path: "/history",
    Component: History,
  },
  {
    path: "/tools",
    Component: Tools,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "*",
    Component: ErrorPage,
  },
]);
