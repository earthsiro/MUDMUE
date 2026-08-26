import React from "react";
import { breakpoints } from "../styles/breakpoints";
import styled from "styled-components";

/**
 * หัวหน้าเพจกลาง — breadcrumb + ชื่อหน้า (+ คำอธิบายและปุ่มฝั่งขวาถ้ามี)
 *
 * เดิมแต่ละหน้าเขียน header ของตัวเอง ทำให้ Chok กับ Chim หน้าตาไม่ตรงกัน
 * ตัวนี้เป็นของกลาง หน้าไหนอยากได้รูปแบบเดียวกันก็หยิบไปใช้ได้เลย
 * (WW Draft ไม่ได้ใช้ เพราะมีธีม Modernist ของตัวเอง)
 */

export interface PageHeaderCrumb {
    name: string;
    /** ไม่ใส่ = กดไม่ได้ ใช้กับหน้าที่ไม่มี route ย่อยให้กระโดดไป */
    url?: string;
}

/**
 * สีของหัวเพจ — ค่าเริ่มต้นเป็นโทน Mudmue (index.css)
 * หน้าที่มีธีมของตัวเอง เช่น WW Draft ส่งชุดสีของตัวเองเข้ามาแทนได้
 */
export interface PageHeaderAppearance {
    ink?: string;
    muted?: string;
    /** สีตอน hover ของ crumb ที่กดได้ */
    accent?: string;
    titleFont?: string;
}

interface PageHeaderProps {
    crumbs: PageHeaderCrumb[];
    title: string;
    subtitle?: string;
    /** ปุ่ม/คอนโทรลฝั่งขวาของบรรทัดชื่อหน้า */
    actions?: React.ReactNode;
    onCrumbClick?: (url: string) => void;
    appearance?: PageHeaderAppearance;
    /** เผื่อหน้าไหนอยากปรับ padding เอง ผ่าน styled(PageHeader) */
    className?: string;
}

/** เทาของ label/breadcrumb — คู่กับ --brand-ink ที่เป็นสีตัวอักษรหลัก */
const MUTED = "#6f6d7d";

const defaultAppearance: Required<PageHeaderAppearance> = {
    ink: "var(--brand-ink)",
    muted: MUTED,
    accent: "var(--brand-blue)",
    titleFont: "inherit",
};

const Header = styled.header`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 24px 24px 16px;

    @media (max-width: ${breakpoints.tablet}px) {
        padding: 16px 16px 12px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        padding: 12px 12px 8px;
    }
`;

const Breadcrumb = styled.nav<{ $muted: string }>`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: ${({ $muted }) => $muted};
`;

const Crumb = styled.button<{
    $current: boolean;
    $clickable: boolean;
    $ink: string;
    $accent: string;
}>`
    padding: 2px 0;
    font: inherit;
    background: none;
    border: none;
    color: ${({ $current, $ink }) => ($current ? $ink : "inherit")};
    font-weight: ${({ $current }) => ($current ? 600 : 400)};
    cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

    &:hover {
        color: ${({ $clickable, $accent }) => ($clickable ? $accent : "inherit")};
        text-decoration: ${({ $clickable }) => ($clickable ? "underline" : "none")};
    }
    &:focus-visible {
        outline: 2px solid ${({ $accent }) => $accent};
        outline-offset: 2px;
        border-radius: 3px;
    }
`;

const TitleRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
`;

const Title = styled.h1<{ $ink: string; $font: string }>`
    margin: 0;
    font-family: ${({ $font }) => $font};
    font-size: clamp(20px, 4vw, 26px);
    font-weight: 800;
    letter-spacing: -0.015em;
    line-height: 1.15;
    color: ${({ $ink }) => $ink};
`;

const Subtitle = styled.p<{ $muted: string }>`
    margin: 0;
    font-size: 14px;
    color: ${({ $muted }) => $muted};
`;

export const PageHeader: React.FC<PageHeaderProps> = ({
    crumbs,
    title,
    subtitle,
    actions,
    onCrumbClick,
    appearance,
    className,
}) => {
    const { ink, muted, accent, titleFont } = { ...defaultAppearance, ...appearance };

    return (
        <Header className={className}>
            <Breadcrumb aria-label="breadcrumb" $muted={muted}>
                {crumbs.map((crumb, index) => {
                    const isCurrent = index === crumbs.length - 1;
                    const isClickable = !isCurrent && !!crumb.url && !!onCrumbClick;
                    return (
                        <span
                            key={crumb.url ?? crumb.name}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                            {index > 0 && <span aria-hidden="true">›</span>}
                            <Crumb
                                type="button"
                                $current={isCurrent}
                                $clickable={isClickable}
                                $ink={ink}
                                $accent={accent}
                                aria-current={isCurrent ? "page" : undefined}
                                onClick={() => isClickable && onCrumbClick!(crumb.url!)}
                            >
                                {crumb.name}
                            </Crumb>
                        </span>
                    );
                })}
            </Breadcrumb>

            <TitleRow>
                <div>
                    <Title $ink={ink} $font={titleFont}>{title}</Title>
                    {subtitle && <Subtitle $muted={muted}>{subtitle}</Subtitle>}
                </div>
                {actions}
            </TitleRow>
        </Header>
    );
};

export default PageHeader;
