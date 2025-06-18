import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const BottomNavBarContainer = styled.div`
  width: 100%;
  display: flex;
`;
export interface NavBarOptionType {
  name: string;
  id: number;
  navigatePath: string;
}
export const NavBarOption: NavBarOptionType[] = [
  { id: 0, name: "Home", navigatePath: "/" },
  { id: 1, name: "Matching", navigatePath: "/matching" },
  { id: 2, name: "LeaderBoard", navigatePath: "/leader-board" },
];
interface BottomNavBarProps {
  onClickMenu?: (menu: NavBarOptionType) => void;
}
export const BottomNavBar = (props: BottomNavBarProps) => {
  const { onClickMenu = () => {} } = props;
  const navigate = useNavigate();

  // const [menu, setMenu] = useState(0);
  const handleClickedMenu = (menu: NavBarOptionType) => {
    if (onClickMenu) {
      onClickMenu(menu);
    }
    navigate(menu.navigatePath);
  };
  return (
    <BottomNavBarContainer>
      {NavBarOption.map((nb: NavBarOptionType) => (
        <button className="btn" onClick={() => handleClickedMenu(nb)}>{nb.name}</button>
      ))}
    </BottomNavBarContainer>
  );
};
