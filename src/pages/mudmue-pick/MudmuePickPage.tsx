import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { TabMenu } from "./components/TabMenu";
import styled from "styled-components";

// Responsive breakpoints
const breakpoints = {
    tablet: 900,
    mobile: 600,
};

const MudmuePickPageContainer = styled.div`
    width: 100%;
    height: 100%;
`;

const MudmuePickTitleContent = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 24px;

    @media (max-width: ${breakpoints.tablet}px) {
        padding: 16px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        padding: 8px;
    }
`;

const MuemuePickContent = styled.div`
    width: 100%;
    height: 100%;
    padding: 0 24px;
    display: flex;

    @media (max-width: ${breakpoints.tablet}px) {
        padding: 0 8px;
        flex-direction: column;
        gap: 16px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        padding: 0 2px;
        flex-direction: column;
        gap: 8px;
    }
`;

const SideMenuContainer = styled.div`
    width: 224px;
    min-width: 120px;
    height: 100%;

    @media (max-width: ${breakpoints.tablet}px) {
        display: none;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        display: none;
    }
`;

const ContentContainer = styled.div`
    width: calc(100% - 224px);

    @media (max-width: ${breakpoints.tablet}px) {
        width: 100%;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        width: 100%;
    }
`;

const TabMenuContainer = styled.div`
    display: none;

    @media (max-width: ${breakpoints.tablet}px) {
        display: flex;
        width: 100%;
        justify-content: flex-start;
        margin-bottom: 0.5rem;
    }
`;

const breadcrumbMap: { [key: string]: string } = {
    "/pick": "MUDMUE Pick",
    "/pick/match-maker": "Matchmaker",
    "/pick/dashboard": "Dashboard",
    "/pick/history": "History",
};

const tabList = [
    { label: "Matchmaker", path: "match-maker" },
    { label: "Dashboard", path: "dashboard" },
    { label: "History", path: "history" },
];

export const MudmuePickPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathName = location.pathname;
    const parts = pathName.split("/").filter(Boolean);

    // Breadcrumb
    const crumbs = parts.map((part, index) => {
        const url = "/" + parts.slice(0, index + 1).join("/");
        return {
            name: breadcrumbMap[url] || part,
            url: url,
        };
    });

    // Menu Navigation
    const handleClickMenu = (path: string) => {
        if (!path.startsWith("/pick")) {
            navigate(`/pick/${path}`);
        } else {
            navigate(path);
        }
    };

    // Tab logic (active tab based on path)
    const getActiveTab = () => {
        for (const tab of tabList) {
            if (pathName.includes(tab.path)) return tab.path;
        }
        return tabList[0].path;
    };

    return (
        <MudmuePickPageContainer>
            <MudmuePickTitleContent>
                <div className="breadcrumbs text-sm w-full overflow-x-auto">
                    <ul className="flex flex-wrap gap-2">
                        {crumbs.map((crumb, idx) => (
                            <li key={idx}>
                                <a
                                    className="font-noto text-[24px]"
                                    style={{ cursor: "pointer", fontSize: "clamp(16px, 4vw, 24px)" }}
                                    onClick={() => handleClickMenu(crumb.url)}
                                >
                                    {crumb.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </MudmuePickTitleContent>
            <MuemuePickContent>
                {/* Side Menu: Desktop only */}
                <SideMenuContainer>
                    <ul className="menu bg-base-200 rounded-box w-full h-auto flex flex-col md:h-[278px]">
                        {tabList.map((tab) => (
                            <li key={tab.path}>
                                <a
                                    className="font-noto text-[18px]"
                                    style={{ fontSize: "clamp(14px, 3vw, 18px)", cursor: "pointer" }}
                                    onClick={() => handleClickMenu(tab.path)}
                                >
                                    {tab.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </SideMenuContainer>

                {/* Tab Menu: Tablet & Mobile only */}
                <TabMenuContainer>
                    <TabMenu tabs={tabList} activeTab={getActiveTab()} onChangeTab={handleClickMenu} />
                </TabMenuContainer>

                <ContentContainer>
                    <Outlet />
                </ContentContainer>
            </MuemuePickContent>
        </MudmuePickPageContainer>
    );
};
