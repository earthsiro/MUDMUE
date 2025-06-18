import LogoMudmue from "../assets/logo-mudmue.png";
import { MudmueButton } from "../components/MudmueButton";
import { MudmueInput } from "../components/MudmueInput";
import React from "react";
import styled from "styled-components";
import { useLoader } from "../components/Loader";

const StoryBookContainer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    padding: 16px;
    display: flex;
    flex-direction: flex-row;
    align-items: flex-start;
    justify-content: center;
`;

interface StoryBookElementProps {
    id: number;
    name: string;
    content: React.ReactNode;
}

export const StoryBookPage = () => {
    const [currentComponentId, setCurrentComponentId] = React.useState<number>(0);
    const { showLoader, hideLoader } = useLoader();
    const StoryBookElementList: StoryBookElementProps[] = [
        {
            id: 0,
            name: "Loader",
            content: (
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <MudmueButton
                        theme="outline-primary"
                        size="large"
                        onClick={() => {
                            showLoader();
                            setTimeout(() => {
                                hideLoader();
                            }, 3000); // Hide loader after 3 seconds
                        }}
                    >
                        Show Loader
                    </MudmueButton>
                    <span className="font-noto text-sm text-gray-500 mt-4 ml-4">
                        Click to show the loader for 3 seconds
                    </span>
                </div>
            ),
        },
        {
            id: 1,
            name: "Button",
            content: (
                <div className="flex flex-wrap gap-4 w-full">
                    <MudmueButton theme="primary">Primary Button</MudmueButton>
                    <MudmueButton theme="primary" size="medium">
                        Primary Button (Medium)
                    </MudmueButton>
                    <MudmueButton theme="primary" size="small">
                        Primary (Small)
                    </MudmueButton>
                    <MudmueButton theme="secondary">Secondary Button</MudmueButton>
                    <MudmueButton theme="secondary" size="medium">
                        Secondary Button (Medium)
                    </MudmueButton>
                    <MudmueButton theme="secondary" size="small">
                        Secondary (Small)
                    </MudmueButton>
                    <MudmueButton theme="primary" disabled>
                        Disabled Button
                    </MudmueButton>
                    <MudmueButton theme="primary" size="medium" disabled>
                        Disabled Button (Medium)
                    </MudmueButton>
                    <MudmueButton theme="primary" size="small" disabled>
                        Disabled Button (Small)
                    </MudmueButton>
                    <MudmueButton theme="outline-primary">Outline Primary Button</MudmueButton>
                    <MudmueButton theme="outline-primary" size="medium">
                        Outline Primary Button (Medium)
                    </MudmueButton>
                    <MudmueButton theme="outline-primary" size="small">
                        Outline Primary (Small)
                    </MudmueButton>
                    <MudmueButton theme="outline-secondary">Outline Secondary Button</MudmueButton>
                    <MudmueButton theme="outline-secondary" size="medium">
                        Outline Secondary Button (Medium)
                    </MudmueButton>
                    <MudmueButton theme="outline-secondary" size="small">
                        Outline Secondary (Small)
                    </MudmueButton>
                </div>
            ),
        },
        {
            id: 2,
            name: "Input",
            content: (
                <div className="flex flex-col gap-2">
                    <MudmueInput
                        value={"Text enter here example"}
                        type="text"
                        size="large"
                        onChange={() => {}}
                    ></MudmueInput>
                    <MudmueInput
                        value={"[Disabled] Text enter here example"}
                        type="text"
                        size="medium"
                        disabled
                        onChange={() => {}}
                    ></MudmueInput>
                    <MudmueInput
                        value={"[Error] Text enter here example"}
                        type="text"
                        size="small"
                        error
                        errorMessage="This is an error message"
                        onChange={() => {}}
                    ></MudmueInput>
                </div>
            ),
        },
    ];

    const handleClick = (id: number) => {
        setCurrentComponentId(id);
        const checkbox = document.getElementById("my-drawer-story-book") as HTMLInputElement;
        if (checkbox) {
            checkbox.checked = !checkbox.checked; // Toggle the state
        }
    };

    return (
        <StoryBookContainer>
            <ul className="menu bg-base-200 text-base-content w-80 h-full p-4">
                <img src={LogoMudmue} alt="Logo Mudmue" width={120} height={120} />

                {StoryBookElementList.map((element: StoryBookElementProps) => (
                    <li onClick={() => handleClick(element.id)} className="drawer-end">
                        <a className="font-noto text-[18px]">{element.name}</a>
                    </li>
                ))}
            </ul>

            <div className="w-full h-full flex flex-col justify-center items-center p-4">
                {StoryBookElementList.find((sb: StoryBookElementProps) => sb.id === currentComponentId)?.content}
            </div>
        </StoryBookContainer>
    );
};
