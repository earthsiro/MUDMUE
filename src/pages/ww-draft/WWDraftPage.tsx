import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { WWSectionTitle, wwTheme } from "./ww-draft.styles";

import { DraftProvider } from "./context/DraftProvider";
import { PageHeader } from "../../components/PageHeader";
import { chok } from "../mudmue-pick/chok.styles";
import { breakpoints } from "../../styles/breakpoints";
import styled from "styled-components";

/* แสงจาง ๆ จากขอบบนแบบฉากหลังเมนูในเกม ไม่ใช่พื้นเรียบสีเดียว */
const PageContainer = styled.div`
    width: 100%;
    min-height: 100%;
    background: radial-gradient(1100px 520px at 50% -8%, #e6eef4 0%, transparent 62%), ${wwTheme.bg};
    color: ${wwTheme.text};
    font-family: ${wwTheme.fontBody};
    display: flex;
    flex-direction: column;
`;

/** ชุดสีของหน้านี้ ส่งให้หัวเพจกลางแทนโทน Mudmue ที่เป็นค่าเริ่มต้น */
const headerAppearance = {
    ink: wwTheme.text,
    muted: wwTheme.neutral600,
    accent: wwTheme.accent,
    titleFont: wwTheme.fontHeading,
};

/** โครงเดียวกับ <Body> ของหน้า Chok: เมนูคอลัมน์ 208px + เนื้อหา */
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

/**
 * เมนูย่อยของหน้านี้จงใจใช้ token ของ MUDMUE Chok ไม่ใช่ `wwTheme` — เมนูย่อยถือเป็น
 * chrome ของเว็บที่ต้องเหมือนกันทุกหน้า ส่วนสีประจำหน้า (ทอง) ปล่อยให้เนื้อหาในกระดาน
 * เป็นคนแบก ถ้าวันหลังมีหน้าที่สามที่ใช้เมนูแบบนี้ ค่อยดึง Nav/NavItem ออกไปเป็น
 * คอมโพเนนต์กลางแล้วให้ทั้งสามหน้าเรียกใช้
 */
const SideNav = styled.nav`
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

    /* สี่แท็บเรียงแถวเดียวบนมือถือจะดันสองอันท้ายตกขอบ — จัดเป็น 2×2 แทน */
    @media (max-width: ${breakpoints.mobile}px) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px;
        overflow: visible;
    }
`;

/** Active item: blue tint wash, blue ink, 3px blue edge — เหมือนหน้า Chok ทุกค่า */
const NavItem = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    min-height: 44px;
    padding: 0 14px;
    font-family: inherit;
    font-size: 14px;
    font-weight: ${({ $active }) => ($active ? 700 : 500)};
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
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
    "/ww-draft": "WuWa MudMue",
    "/ww-draft/draft": "Draft",
    "/ww-draft/pool": "Pool",
    "/ww-draft/settings": "Timer",
    "/ww-draft/history": "History",
};

const tabList = [
    { label: "Draft", path: "draft" },
    { label: "Pool", path: "pool" },
    { label: "Timer", path: "settings" },
    { label: "History", path: "history" },
];

export const WWDraftPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathName = location.pathname;
    const parts = pathName.split("/").filter(Boolean);

    const crumbs = parts.map((part, index) => {
        const url = "/" + parts.slice(0, index + 1).join("/");
        return { name: breadcrumbMap[url] || part, url };
    });

    const handleClickMenu = (path: string) => {
        navigate(path.startsWith("/ww-draft") ? path : `/ww-draft/${path}`);
    };

    const activeTab = tabList.find((tab) => pathName.includes(tab.path)) ?? tabList[0];

    return (
        <DraftProvider>
            <PageContainer>
                <PageHeader
                    crumbs={crumbs}
                    title="WuWa MudMue"
                    appearance={headerAppearance}
                    onCrumbClick={handleClickMenu}
                />

                <Body>
                    <SideNav aria-label="เมนู WuWa MudMue">
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
                    </SideNav>

                    <Content>
                        <WWSectionTitle>{activeTab.label}</WWSectionTitle>
                        <Outlet />
                    </Content>
                </Body>
            </PageContainer>
        </DraftProvider>
    );
};
