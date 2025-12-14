import React, { useState } from "react";

import FoodMap from "./components/FoodMap";
import Sidebar from "./components/Sidebar";
import { places as mockPlaces } from "./components/mockPlace";
import styled from "styled-components";

// Responsive breakpoints
const breakpoints = {
    tablet: 900,
    mobile: 600,
};

const FoodMapPageContainer = styled.div`
    width: 100%;
    height: 100%;
`;

const FoodMapTitleContent = styled.div`
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

const FoodMapContent = styled.div`
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

const SidebarContainer = styled.div`
    width: 280px;
    min-width: 120px;
    height: 100%;

    @media (max-width: ${breakpoints.tablet}px) {
        width: 100%;
        min-width: 0;
        margin-bottom: 12px;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        width: 100%;
        min-width: 0;
        margin-bottom: 8px;
    }
`;

const MapContainerStyled = styled.div`
    width: calc(100% - 280px);
    min-width: 200px;
    height: 80vh;

    @media (max-width: ${breakpoints.tablet}px) {
        width: 100%;
        min-width: 0;
        height: 60vh;
    }
    @media (max-width: ${breakpoints.mobile}px) {
        width: 100%;
        min-width: 0;
        height: 45vh;
    }
`;

export const FoodMapPage: React.FC = () => {
    const [search, setSearch] = useState("");
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

    // Breadcrumb (ถ้าต้องการ)
    // const breadcrumbs = [{ label: "MUDMUE Chim", path: "/" }];

    return (
        <FoodMapPageContainer>
            <FoodMapTitleContent>
                <span style={{
                    fontFamily: "cursive",
                    fontWeight: 700,
                    marginRight: 20,
                    fontSize: 32,
                    color: "#c05cb4"
                }}>
                    MM
                </span>
                <span style={{
                    fontWeight: 700,
                    fontSize: 24
                }}>
                    MUDMUE Chim - Food Map
                </span>
            </FoodMapTitleContent>

            <FoodMapContent>
                {/* Sidebar */}
                <SidebarContainer>
                    <Sidebar
                        places={mockPlaces}
                        search={search}
                        setSearch={setSearch}
                        selectedPlaceId={selectedPlaceId}
                        setSelectedPlaceId={setSelectedPlaceId}
                    />
                </SidebarContainer>

                {/* Map */}
                <MapContainerStyled>
                    <FoodMap
                        places={mockPlaces}
                        selectedPlaceId={selectedPlaceId}
                    />
                </MapContainerStyled>
            </FoodMapContent>
        </FoodMapPageContainer>
    );
};

export default FoodMapPage;