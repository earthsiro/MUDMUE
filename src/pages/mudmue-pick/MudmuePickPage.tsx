import { ChokSectionTitle, chok } from "./chok.styles";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { PageHeader } from "../../components/PageHeader";
import { breakpoints } from "../../styles/breakpoints";
import styled from "styled-components";

const PageContainer = styled.div`
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    color: ${chok.ink};
`;

/**
 * The page used to ship two copies of the menu — a sidebar and a `TabMenu` —
 * toggled with `display:none`, so every nav change had to be made twice. This
 * is one nav that turns from a column into a scrollable row at 900px.
 */
const Body = styled.div`
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 208px minmax(0, 1fr);
    gap: 24px;
    padding: 0 24px 32px;

    @media (max-width: ${breakpoints.tablet}px) {
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;
        padding: 0 16px 24px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        padding: 0 12px 16px;
    }
`;

const Nav = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-self: start;
    padding: 8px;
    background: ${chok.surfaceAlt};
    border: 1px solid ${chok.line};
    border-radius: 12px;

    @media (max-width: ${breakpoints.tablet}px) {
        flex-direction: row;
        overflow-x: auto;
        padding: 6px;
        gap: 2px;
    }

    /* Four tabs in one scrolling row hides the last two on a phone; a 2×2 block
       keeps them all visible at full tap size. */
    @media (max-width: ${breakpoints.mobile}px) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
        overflow: visible;
    }
`;

const NavItem = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    font-family: inherit;
    font-size: 14px;
    font-weight: ${({ $active }) => ($active ? 700 : 500)};
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    background: ${({ $active }) => ($active ? chok.primaryTint : "transparent")};
    color: ${({ $active }) => ($active ? chok.primary : chok.inkSoft)};
    box-shadow: ${({ $active }) => ($active ? `inset 3px 0 0 ${chok.primary}` : "none")};
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
        background: ${({ $active }) => ($active ? chok.primaryTint : chok.hover)};
        color: ${({ $active }) => ($active ? chok.primary : chok.ink)};
    }
    &:active {
        background: ${({ $active }) => ($active ? chok.primaryTintStrong : chok.pressed)};
    }
    &:focus-visible {
        outline: 3px solid ${chok.primary};
        outline-offset: -1px;
    }

    @media (max-width: ${breakpoints.tablet}px) {
        flex: 1 0 auto;
        justify-content: center;
        box-shadow: ${({ $active }) => ($active ? `inset 0 -3px 0 ${chok.primary}` : "none")};
    }

    @media (max-width: ${breakpoints.mobile}px) {
        padding: 0 8px;
        font-size: 13.5px;
    }
`;

const Content = styled.main`
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const breadcrumbMap: { [key: string]: string } = {
    "/chok": "MUDMUE Chok",
    "/chok/match-maker": "Matchmaker",
    "/chok/dashboard": "Dashboard",
    "/chok/history": "History",
    "/chok/profile": "Profile",
};

const tabList = [
    { label: "Matchmaker", path: "match-maker" },
    { label: "Dashboard", path: "dashboard" },
    { label: "History", path: "history" },
    { label: "Profile", path: "profile" },
];

export const MudmuePickPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathName = location.pathname;
    const parts = pathName.split("/").filter(Boolean);

    const crumbs = parts.map((part, index) => {
        const url = "/" + parts.slice(0, index + 1).join("/");
        return { name: breadcrumbMap[url] || part, url };
    });

    const handleClickMenu = (path: string) => {
        navigate(path.startsWith("/chok") ? path : `/chok/${path}`);
    };

    const activeTab = tabList.find((tab) => pathName.includes(tab.path)) ?? tabList[0];

    return (
        <PageContainer>
            <PageHeader
                crumbs={crumbs}
                title="MUDMUE Chok"
                onCrumbClick={handleClickMenu}
            />

            <Body>
                <Nav aria-label="เมนู Mudmue Chok">
                    {tabList.map((tab) => (
                        <NavItem
                            key={tab.path}
                            type="button"
                            $active={activeTab.path === tab.path}
                            aria-current={activeTab.path === tab.path ? "page" : undefined}
                            onClick={() => handleClickMenu(tab.path)}
                        >
                            {tab.label}
                        </NavItem>
                    ))}
                </Nav>

                <Content>
                    <ChokSectionTitle>{activeTab.label}</ChokSectionTitle>
                    <Outlet />
                </Content>
            </Body>
        </PageContainer>
    );
};
