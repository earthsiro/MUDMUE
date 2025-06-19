import { HomePage } from "../pages/home/HomePage";
import { LeaderBoardPage } from "../pages/leader-board/LeaderBoardPage";
import { MainLayout } from "../pages/MainLayout";
import { MudmueDashboard } from "../pages/mudmue-pick/dashboard/MudmueDashboard";
import { MudmueHistory } from "../pages/mudmue-pick/history/MudmueHistory";
import { MudmueMatchmaker } from "../pages/mudmue-pick/matchmaker/MudmueMatchmaker";
import { MudmuePickPage } from "../pages/mudmue-pick/MudmuePickPage";
import { StoryBookPage } from "../pages/StoryBookPage";
import { createBrowserRouter } from "react-router-dom";

export const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "", element: <HomePage /> },
      {
        path: "pick",
        element: <MudmuePickPage />,
        children: [
          { path: "match-maker", element: <MudmueMatchmaker /> },
          { path: "history", element: <MudmueHistory /> },
          { path: "dashboard", element: <MudmueDashboard /> },
        ],
      },
      { path: "leader-board", element: <LeaderBoardPage /> },
      { path: "story-book", element: <StoryBookPage /> },
    ],
  },
  // {
  //   path: "/story-book",
  //   element: <StoryBookPage />,
  // },
];
export const routerConfigs = createBrowserRouter(routes, {
  basename: "/mudmue",
});
