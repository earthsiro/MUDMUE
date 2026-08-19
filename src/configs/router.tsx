import { FoodMapPage } from "../pages/mudmue-chim/MudmueChimPage";
import { HomePage } from "../pages/home/HomePage";
import { MainLayout } from "../pages/MainLayout";
import { MudmueDashboard } from "../pages/mudmue-pick/dashboard/MudmueDashboard";
import { MudmueHistory } from "../pages/mudmue-pick/history/MudmueHistory";
import { MudmueMatchmaker } from "../pages/mudmue-pick/matchmaker/MudmueMatchmaker";
import { MudmuePickPage } from "../pages/mudmue-pick/MudmuePickPage";
import { MudmueProfile } from "../pages/mudmue-pick/profile/MudmueProfile";
import { Navigate, createBrowserRouter } from "react-router-dom";

import { StoryBookPage } from "../pages/StoryBookPage";
import { WWDraftBoard } from "../pages/ww-draft/draft/WWDraftBoard";
import { WWDraftPage } from "../pages/ww-draft/WWDraftPage";
import { WWMatchHistory } from "../pages/ww-draft/history/WWMatchHistory";
import { WWPoolManager } from "../pages/ww-draft/pool/WWPoolManager";
import { WWTimerSettings } from "../pages/ww-draft/settings/WWTimerSettings";







export const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "", element: <HomePage /> },
      {
        path: "chok",
        element: <MudmuePickPage />,
        children: [
          { index: true, element: <Navigate to="match-maker" replace /> },
          { path: "match-maker", element: <MudmueMatchmaker /> },
          { path: "history", element: <MudmueHistory /> },
          { path: "dashboard", element: <MudmueDashboard /> },
          { path: "profile", element: <MudmueProfile /> },
        ],
      },
      {
        path: "ww-draft",
        element: <WWDraftPage />,
        children: [
          { index: true, element: <Navigate to="draft" replace /> },
          { path: "draft", element: <WWDraftBoard /> },
          { path: "pool", element: <WWPoolManager /> },
          { path: "settings", element: <WWTimerSettings /> },
          { path: "history", element: <WWMatchHistory /> },
        ],
      },
      // เดิมแอปนี้อยู่ที่ /pick — ลิงก์/bookmark เก่ายังใช้ได้
      { path: "pick", element: <Navigate to="/chok" replace /> },
      { path: "pick/*", element: <Navigate to="/chok" replace /> },
      // { path: "leader-board", element: <LeaderBoardPage /> },
      { path: "chim", element: <FoodMapPage /> },
      { path: "story-book", element: <StoryBookPage /> },
    ],
  },
  // {
  //   path: "/story-book",
  //   element: <StoryBookPage />,
  // },
];
export const routerConfigs = createBrowserRouter(routes, {
  basename: "/MUDMUE",
});
