import styled, { keyframes } from "styled-components";

import { motion } from "framer-motion";

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Background = styled.div`
    height: 100%;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(-45deg, rgba(251, 194, 235, 0.3), rgba(166, 193, 238, 0.3), rgba(251, 194, 235, 0.3));
    background-size: 200% 200%;
    animation: ${gradientShift} 8s ease infinite;
    z-index: -2;
`;

const LogoText = styled(motion.div)`
    font-size: 64rem;
    line-height: 1;
    font-weight: bold;
    color: white;
    opacity: 0.4;
    pointer-events: none;
    z-index: -1;
`;

const TaglineContainer = styled(motion.div)`
    text-align: center;
`;

const Tagline = styled.p`
    font-size: 2rem;
    color: #374151; /* gray-700 */
    margin-bottom: 1rem;
`;

export const HomePage = () => {

    return (
        <Background>
            <TaglineContainer
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
            >
                <Tagline>Mud Mue Choke!</Tagline>
            </TaglineContainer>
            <div className="absolute bottom-[-120px] flex justify-center item-end">
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
            </div>
        </Background>
    );
};
