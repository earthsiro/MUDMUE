// import BrandMudmue from "../assets/brand-mudmue.png";

import IconHamburger from "../assets/icon-hamburger.png";
import LogoMudmue from "../assets/logo-mudmue.png";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

interface MainMenuProps {
  id: number;
  name: string;
  path: string;
}
const MainMenuList: MainMenuProps[] = [
  { id: 0, name: "Home", path: "/" },
  {
    id: 1,
    name: "MUDMUE Pick",
    path: "/pick",
  },
  {
    id: 2,
    name: "Story Book",
    path: "/story-book",
  },
];
// const MainLayoutContainer = styled.div`
//   width: 100%;
//   height: 100%;
//   position: relative;
// `;
const MainLayoutSection = styled.div`
  height: 100%;
  width: 100%;
`;
// const MainLayoutFooter = styled.div`
//   height: 13rem;
//   background-color: #f8f8f8;
//   display: flex;
// `;
const MainLayoutHeader = styled.div`
  height: 88px;
  width: 100%;
  background-image: linear-gradient(#cacaf0, #fbc0e0 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;
export const MainLayout = () => {
  const navigate = useNavigate();
  const handleClickMenu = (path: string) => {
    navigate(path);
    const drawerToggle = document.getElementById(
      "my-drawer"
    ) as HTMLInputElement;
    if (drawerToggle) drawerToggle.checked = false;
  };
  // return (
  //   <div className="w-full h-full absolute">
  //     <MainLayoutHeader>
  //        <img src={LogoMudmue} alt="logo-mudmue" width={88} height={88} />
  //        <img src={IconHamburger} alt="menu" className="cursor-pointer" width={64} height={64} />
  //     </MainLayoutHeader>
  //     <MainLayoutSection>
  //       <Outlet /> {/* This will render the matched child route component */}
  //     </MainLayoutSection>
  //     <MainLayoutFooter>
  //       <BottomNavBar />
  //     </MainLayoutFooter>
  //   </div>
  // );
  return (
    <div className="drawer h-full w-full absolute drawer-end">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col h-full">
        {/* Header */}
        <MainLayoutHeader>
          <img src={LogoMudmue} alt="logo-mudmue" width={88} height={88} />
          {/* 👇 เปิด drawer ด้วย htmlFor */}
          <label htmlFor="my-drawer">
            <img
              src={IconHamburger}
              alt="menu"
              className="cursor-pointer"
              width={64}
              height={64}
            />
          </label>
        </MainLayoutHeader>

        {/* Main content */}
        <MainLayoutSection>
          <Outlet />
        </MainLayoutSection>

        {/* Footer */}
        {/* <MainLayoutFooter>
          <div className="w-[40%]">
            <div className="w-full flex justify-center items-center">
              <img
                src={BrandMudmue}
                alt="logo-brand-mudmue"
                width={345}
                height={200}
              />
            </div>
          </div>
          <div className="w-[60%] p-[24px]">
            <div className="w-full flex flex-col justify-center items-start">
              <h2 className="font-noto text-[28px] font-bold">About Us</h2>
              <a>contact 1</a>
              <a>contact 2</a>
              <a>contact 3</a>
            </div>
          </div>
        </MainLayoutFooter> */}
      </div>

      {/* Drawer Side */}
      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-10 gap-6">
          <img src={LogoMudmue} alt="Logo Mudmue" width={320} height={200} />
          <div className="underline h-[3px] bg-[#D9D9D9] rounded-[8px]"></div>
          {MainMenuList.map((element: MainMenuProps) => (
            <li
              key={element.id}
              onClick={() => handleClickMenu(element.path)}
              className="drawer-end"
            >
              <a className="font-noto text-[28px]">{element.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
