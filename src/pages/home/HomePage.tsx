import styled, { keyframes } from "styled-components";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Background = styled.div`
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(-45deg, rgba(251, 194, 235, 0.3), rgba(166, 193, 238, 0.3), rgba(251, 194, 235, 0.3));
    background-size: 200% 200%;
    animation: ${gradientShift} 8s ease infinite;
`;

/* Giant "MM" that slides in and sits behind the content — full-screen scale */
const GhostLayer = styled.div`
    position: absolute;
    bottom: -120px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    z-index: 0;
    pointer-events: none;
`;

const LogoText = styled(motion.div)`
    font-size: 64rem;
    line-height: 0.8;
    font-weight: bold;
    color: white;
    opacity: 0.4;
`;

const CenterContent = styled(motion.div)`
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2.5rem;
    padding: 0 20px;
    width: 100%;
`;

const Tagline = styled.p`
    font-size: clamp(2rem, 6vw, 2.75rem);
    font-weight: 700;
    color: #3a3a52;
    margin: 0;
`;

const CardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    width: 100%;
    max-width: 900px;

    @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
        max-width: 520px;
    }
    @media (max-width: 720px) {
        grid-template-columns: 1fr;
        max-width: 340px;
    }
`;

const AppCard = styled(motion.button)<{ accent: string }>`
    text-align: left;
    cursor: pointer;
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    padding: 18px;
    background: rgba(255, 255, 255, 0.72);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 8px 22px -14px rgba(40, 40, 90, 0.4);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 14px 30px -14px rgba(40, 40, 90, 0.45);
        border-color: ${({ accent }) => accent};
    }
    &:focus-visible {
        outline: 3px solid ${({ accent }) => accent};
        outline-offset: 2px;
    }
`;

const CardIcon = styled.div<{ accent: string }>`
    width: 46px;
    height: 46px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 24px;
    background: ${({ accent }) => `color-mix(in srgb, ${accent} 14%, #ffffff)`};
    border: 1px solid ${({ accent }) => `color-mix(in srgb, ${accent} 30%, transparent)`};
`;

const CardTitle = styled.h4`
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #1e1e28;
`;

const CardDesc = styled.p`
    margin: 0;
    font-size: 13px;
    color: #6b6b7b;
`;

const CardGo = styled.span<{ accent: string }>`
    margin-top: auto;
    padding-top: 6px;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: ${({ accent }) => accent};
`;

interface AppMenuItem {
    id: number;
    icon: string;
    title: string;
    desc: string;
    cta: string;
    path: string;
    accent: string;
}

const APP_MENU: AppMenuItem[] = [
    {
        id: 0,
        icon: "🏸",
        title: "MUDMUE Chok",
        desc: "จับคู่ผู้เล่นแบดมินตันแบบสุ่มด้วยรูเล็ต",
        cta: "เข้าเล่น →",
        path: "/chok",
        accent: "var(--brand-blue)",
    },
    {
        id: 1,
        icon: "🗺️",
        title: "MUDMUE Chim",
        desc: "แผนที่ปักหมุด & รีวิวร้านอาหาร",
        cta: "เปิดแผนที่ →",
        path: "/chim",
        accent: "var(--brand-pink)",
    },
    {
        id: 2,
        icon: "🧮",
        title: "MUDMUE Han",
        desc: "หารค่าคอร์ท & ค่าลูกแบดหลังเล่นจบ",
        cta: "หารเลย →",
        path: "/han",
        accent: "var(--brand-blue-soft)",
    },
    {
        id: 3,
        icon: "⚔️",
        title: "WuWa MudMue",
        desc: "Ban & Pick ทัวร์นาเมนต์ Wuthering Waves",
        cta: "เปิดกระดาน →",
        path: "/ww-draft",
        accent: "#c2a3ff",
    },
    {
        id: 4,
        icon: "📖",
        title: "Story Book",
        desc: "คลัง component ของเว็บ",
        cta: "ดู component →",
        path: "/story-book",
        accent: "#7a5cff",
    },
];

export const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Background>
            <GhostLayer>
                <LogoText
                    initial={{ x: "-2000px", opacity: 0 }}
                    animate={{ x: 0, opacity: 0.4 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                >
                    M
                </LogoText>
                <LogoText
                    initial={{ x: "2000px", opacity: 0 }}
                    animate={{ x: 0, opacity: 0.4 }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                >
                    M
                </LogoText>
            </GhostLayer>

            <CenterContent
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
            >
                <Tagline>Mud Mue!</Tagline>
                <CardGrid>
                    {APP_MENU.map((item) => (
                        <AppCard
                            key={item.id}
                            accent={item.accent}
                            onClick={() => navigate(item.path)}
                            whileTap={{ scale: 0.97 }}
                        >
                            <CardIcon accent={item.accent}>{item.icon}</CardIcon>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDesc>{item.desc}</CardDesc>
                            <CardGo accent={item.accent}>{item.cta}</CardGo>
                        </AppCard>
                    ))}
                </CardGrid>
            </CenterContent>
        </Background>
    );
};
