import { ChokSectionTitle, chok } from "../mudmue-pick/chok.styles";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { HanProvider } from "./context/HanProvider";
import { PageHeader } from "../../components/PageHeader";
import { breakpoints } from "../../styles/breakpoints";
import styled from "styled-components";

/**
 * MUDMUE Han (หาร) — หารค่าคอร์ท/ค่าลูกแบดหลังเล่นจบ
 *
 * โครงหน้าเหมือน Chok และ WuWa เป๊ะ (หัวเพจกลาง + เมนูคอลัมน์ 208px ที่กลายเป็นแถวบน
 * แท็บเล็ต) เมนูย่อยถือเป็น chrome ของเว็บที่ต้องหน้าตาเดียวกันทุกแอป จึงใช้ token ของ
 * Chok ตรง ๆ ไม่ตั้งชุดสีใหม่
 */

const PageContainer = styled.div`
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    color: ${chok.ink};
`;

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

    /* สามแท็บพอดีกับความกว้างมือถือ ไม่ต้องให้เลื่อน — แบ่งเท่า ๆ กันไปเลย
       (ต่างจาก Chok ที่มีสี่แท็บจนต้องจัดเป็น 2×2) */
    @media (max-width: ${breakpoints.mobile}px) {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
    "/han": "MUDMUE Han",
    "/han/calculator": "คำนวณ",
    "/han/history": "ประวัติ",
    "/han/settings": "ตั้งค่า",
};

const tabList = [
    { label: "คำนวณ", path: "calculator" },
    { label: "ประวัติ", path: "history" },
    { label: "ตั้งค่า", path: "settings" },
];

export const MudmueHanPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathName = location.pathname;
    const parts = pathName.split("/").filter(Boolean);

    const crumbs = parts.map((part, index) => {
        const url = "/" + parts.slice(0, index + 1).join("/");
        return { name: breadcrumbMap[url] || part, url };
    });

    const handleClickMenu = (path: string) => {
        navigate(path.startsWith("/han") ? path : `/han/${path}`);
    };

    const activeTab = tabList.find((tab) => pathName.includes(tab.path)) ?? tabList[0];

    return (
        <HanProvider>
            <PageContainer>
                <PageHeader
                    crumbs={crumbs}
                    title="MUDMUE Han"
                    subtitle="หารค่าคอร์ทและค่าลูกแบดหลังเล่นจบ"
                    onCrumbClick={handleClickMenu}
                />

                <Body>
                    <Nav aria-label="เมนู Mudmue Han">
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
        </HanProvider>
    );
};
