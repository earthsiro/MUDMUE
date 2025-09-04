import React from "react";
import styled from "styled-components";

const TabMenuContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 0.5rem;
`;

const TabsBox = styled.div`
    width: 100%;
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
`;

const TabRadio = styled.input`
    display: none;
`;

const TabLabel = styled.label<{ active?: boolean }>`
    width: 100%;
    padding: 16px;
    border-radius: 4px;
    font-family: "Noto", sans-serif;
    font-size: 18px;
    background: ${({ active }) => (active ? "#e9e9fe" : "transparent")};
    color: ${({ active }) => (active ? "#222" : "#666")};
    cursor: pointer;
    border-bottom: ${({ active }) => (active ? "2px solid #CACAFB" : "0px solid #ccc")};
    transition: background 0.2s, color 0.2s, border 0.2s;

    &:hover {
        background: #CACAFB;
        color: #222;
    }
`;

export type TabInfo = { label: string; path: string };

export function TabMenu({
    tabs,
    activeTab,
    onChangeTab,
}: {
    tabs: TabInfo[];
    activeTab: string;
    onChangeTab: (path: string) => void;
}) {
    return (
        <TabMenuContainer>
            <TabsBox>
                {tabs.map((tab, idx) => (
                    <React.Fragment key={tab.path}>
                        <TabRadio
                            id={`tab_${tab.path}_${idx}`}
                            type="radio"
                            name="mudmue_tabs"
                            checked={activeTab === tab.path}
                            onChange={() => onChangeTab(tab.path)}
                        />
                        <TabLabel
                            htmlFor={`tab_${tab.path}`}
                            active={activeTab === tab.path}
                            onClick={() => onChangeTab(tab.path)}
                        >
                            {tab.label}
                        </TabLabel>
                    </React.Fragment>
                ))}
            </TabsBox>
        </TabMenuContainer>
    );
}
