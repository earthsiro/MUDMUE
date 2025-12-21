import { ReactNode, createContext, useContext, useState } from "react";
import styled, { keyframes } from "styled-components";

import IconPunchLeft from "../assets/punch-left-blue.png";
import IconPunchRight from "../assets/punch-right-red.png";

// import { LineWave } from "react-loader-spinner";




// สร้าง context
interface LoaderContextProps {
    showLoader: () => void;
    hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextProps>({
    showLoader: () => {},
    hideLoader: () => {},
});

const punchLeftAnim = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-70px); }
  50% { transform: translateX(0); }
  70% { transform: translateX(-40px); }
  100% { transform: translateX(0); }
`;

const PunchLeft = styled.img`
    position: absolute;
    left: 20%;
    z-index: 2;
    animation: ${punchLeftAnim} 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
`;

// หมัดขวา เลื่อนไป-กลับ และชนกัน (กลับด้านทิศ)
const punchRightAnim = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(70px); }
  50% { transform: translateX(0); }
  70% { transform: translateX(40px); }
  100% { transform: translateX(0); }
`;

const PunchRight = styled.img`
    position: absolute;
    right: 20%;
    z-index: 2;
    animation: ${punchRightAnim} 1.8s cubic-bezier(0.77, 0, 0.175, 1) infinite;
`;

// Provider component
export const LoaderProvider = ({ children }: { children: ReactNode }) => {
    const [visible, setVisible] = useState(false);

    const showLoader = () => setVisible(true);
    const hideLoader = () => setVisible(false);

    return (
        <LoaderContext.Provider value={{ showLoader, hideLoader }}>
            {children}
            {visible && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-50">
                    {/* <LineWave
                        visible={true}
                        height="240"
                        width="240"
                        color="#4fa94d"
                        ariaLabel="line-wave-loading"
                        wrapperStyle={{}}
                        wrapperClass=""
                        firstLineColor="#0000FF"
                        middleLineColor="#CACAFB"
                        lastLineColor="#FF1493"
                    /> */}
                    <div
                        style={{
                            width: 350,
                            height: 250,
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <PunchLeft src={IconPunchLeft} alt="loader-punch-left" style={{ width: 90, height: 90 }} />
                        <PunchRight src={IconPunchRight} alt="loader-punch-right" style={{ width: 90, height: 90 }} />
                    </div>
                </div>
            )}
        </LoaderContext.Provider>
    );
};

// hook ใช้เรียก
export const useLoader = () => useContext(LoaderContext);
