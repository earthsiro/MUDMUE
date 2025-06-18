import React from "react";
import styled from "styled-components";

interface MudmueButtonContainerProps {
    size: SizeType;
    theme: ThemeType;
}
const MudmueButtonContainer = styled.button<MudmueButtonContainerProps>`
    ${({ size }) => {
        switch (size) {
            case "small":
                return `
          width: 50%;
          max-width: 186px;
        `;
            case "medium":
                return `
          width: 75%;
          max-width: 261px;
        `;
            case "large":
                return `
          width: 100%;
          max-width: 375px;
        `;
            default:
                return `
      width: 100%;
      max-width: 375px;
    `;
        }
    }}
    height: 4rem;
    border-radius: 50px;
    ${({ theme }) => {
        switch (theme) {
            case "primary":
                return `
                  background-color: #0000FF;
                  color: white;
                  &:hover {
                    background-color: #FFFFFF;
                    color: #8080FF;
                    box-shadow: 0px 0px 5px 0px #0000FF;
                    -webkit-box-shadow: 0px 0px 5px 0px #0000FF;
                    -moz-box-shadow: 0px 0px 5px 0px #0000FF;
                  }
          `;
            case "secondary":
                return `
                  background-color: #FF1493;
                  color: white;
                  &:hover {
                    background-color: #FFFFFF;
                    color: #FF89C9;
                    border: 1px solid #FF1493;
                    box-shadow: 0px 0px 5px 0px #FF1493;
                    -webkit-box-shadow: 0px 0px 5px 0px #FF1493;
                    -moz-box-shadow: 0px 0px 5px 0px #FF1493;
                  }
          `;
            case "outline-primary":
                return `
                  background-color: white;
                  color: #0000FF;
                  border: 1px solid #0000FF;
                  &:hover {
                    box-shadow: 0px 0px 5px 0px #0000FF;
                    -webkit-box-shadow: 0px 0px 5px 0px #0000FF;
                    -moz-box-shadow: 0px 0px 5px 0px #0000FF;
                  }
          `;
            case "outline-secondary":
                return `
                  background-color: white;
                  color: #FF1493;
                  border: 1px solid #FF1493;
                  &:hover {
                    border: 1px solid #FF1493;
                    box-shadow: 0px 0px 5px 0px #FF1493;
                    -webkit-box-shadow: 0px 0px 5px 0px #FF1493;
                    -moz-box-shadow: 0px 0px 5px 0px #FF1493;
                  }
              `;
            default:
                return `
            background-color: #0000FF;
            box-shadow: 0px 0px 5px 0px #8080FF;
            -webkit-box-shadow: 0px 0px 5px 0px #8080FF;
            -moz-box-shadow: 0px 0px 5px 0px #8080FF;
            color: white;`;
        }
    }}
    &:disabled {
        background-color: #d4d2d5;
        color: #7c7878;
        border: none;
        box-shadow: 0px 0px 5px 0px #d4d2d5;
        -webkit-box-shadow: 0px 0px 5px 0px #d4d2d5;
        -moz-box-shadow: 0px 0px 5px 0px #d4d2d5;
    }
    display: flex;
    justify-content: center;
    align-items: center;
`;
type SizeType = "small" | "medium" | "large";
type ThemeType = "primary" | "secondary" | "outline-primary" | "outline-secondary";
interface MudmueButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
    size?: SizeType;
    theme?: ThemeType;
    disabled?: boolean;
}
export const MudmueButton = (props: MudmueButtonProps) => {
    const {
        onClick = () => {},
        children = <span>Hello</span>,
        size = "large",
        theme = "primary",
        disabled = false,
    } = props;
    return (
        <MudmueButtonContainer size={size} onClick={onClick} theme={theme} disabled={disabled}>
            {children}
        </MudmueButtonContainer>
    );
};
