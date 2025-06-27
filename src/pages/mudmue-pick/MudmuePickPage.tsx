import { Outlet, useLocation, useNavigate } from "react-router-dom";

import styled from "styled-components";

const MudmuePickPageContainer = styled.div`
  width: 100%;
  height: 100%;
`;
const MudmuePickTitleContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 24px 24px 24px 24px;
`;
const MuemuePickContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 0px 24px;
  display: flex;
`;
const breadcrumbMap: { [key: string]: string } = {
  "/pick": "MUDMUE Pick",
  "/pick/match-maker": "Matchmaker",
  "/pick/dashboard": "Dashboard",
  "/pick/history": "History",
};
export const MudmuePickPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathName = location.pathname;
  const parts = pathName.split("/").filter(Boolean);

  const crumbs = parts.map((part, index) => {
    const url = "/" + parts.slice(0, index + 1).join("/");
    return {
      name: breadcrumbMap[url] || part,
      url: url,
    };
  });
  const handleClickMenu = (path: string) => {
    navigate(path);
  };
  return (
    <MudmuePickPageContainer>
      <MudmuePickTitleContent>
        <div className="breadcrumbs text-sm">
          <ul>
            {crumbs.map((crumb, idx) => (
              <li key={idx}>
                <a className="font-noto text-[24px]" href={crumb.url}>
                  {crumb.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </MudmuePickTitleContent>
      <MuemuePickContent>
        <div className="w-56 h-full">
          <ul className="menu bg-base-200 rounded-box w-56 h-[278px]">
            <li>
              <a className="font-noto text-[18px]" onClick={()=>handleClickMenu("match-maker")}>Matchmaker</a>
            </li>
            <li>
              <a className="font-noto text-[18px]" onClick={()=>handleClickMenu("dashboard")}>Dashboard</a>
            </li>
            <li>
              <a className="font-noto text-[18px]" onClick={()=>handleClickMenu("history")}>History</a>
            </li>
          </ul>
        </div>
        <div className="w-[calc(100%-56px)] h-full">
          <Outlet />
        </div>
      </MuemuePickContent>
    </MudmuePickPageContainer>
  );
};
