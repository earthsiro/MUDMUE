import { ReactNode, createContext, useContext, useState } from "react";

import { LineWave } from "react-loader-spinner";

// สร้าง context
interface LoaderContextProps {
    showLoader: () => void;
    hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextProps>({
    showLoader: () => {},
    hideLoader: () => {},
});

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
                    <LineWave
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
                    />
                </div>
            )}
        </LoaderContext.Provider>
    );
};

// hook ใช้เรียก
export const useLoader = () => useContext(LoaderContext);
