import styled from "styled-components";

interface MudmueInputContainerProps {
  isError: boolean;
  size: SizeType;
}
const MudmueInputContainer = styled.input<MudmueInputContainerProps>`
  background-color: #ffffff;
  color: #000000;
  padding: 1rem;
  line-height: 24px;
  border-radius: 50px;
  max-width: 375px;
  border: 1px solid #8383fb;
  ${({ isError }) => {
    if (isError) {
      return `
        border: 1px solid #FF1493;
        background-color: #FEE6F3;
        cursor: not-allowed;
      `;
    }
  }}
  ${({ size }) => {
    switch (size) {
      case "small":
        return `
            width: 128px;
          `;
      case "medium":
        return `
            width: 237px;
          `;
      case "large":
        return `
            width: 375px;
          `;
      default:
        return `
        width: 375px;
      `;
    }
  }}
  &:disabled {
    background-color: #f2f2f2;
    border: 1px solid #f2f2f2;
    cursor: not-allowed;
  }
`;
const MudmueErrorText = styled.span`
  color: #ff1493;
  font-size: 12px;
  line-height: 16px;
  text-align: left;
`;
type InputType = "text" | "datepicker" | "dropdown";
type SizeType = "small" | "medium" | "large";
interface MudmueInputProps {
  onChange: (val: string) => void;
  type: InputType;
  value: string;
  disabled?: boolean;
  error?: boolean;
  size: SizeType;
  errorMessage?: string;
}
export const MudmueInput = (props: MudmueInputProps) => {
  const {
    type = "text",
    value,
    disabled,
    error = false,
    size = "large",
    errorMessage = "",
    onChange = (val: string) => {
      console.log(val);
    },
  } = props;
  return (
    <>
      {type === "text" && (
        <MudmueInputContainer
          value={value}
          disabled={disabled}
          isError={error}
          size={size}
          onChange={(e) => onChange(e.target.value)}
        ></MudmueInputContainer>
      )}
      {errorMessage !== "" && <MudmueErrorText>{errorMessage}</MudmueErrorText>}
    </>
  );
};
