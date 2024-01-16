import * as React from "react";
import { styled, useTheme } from "../../../theme/index.js";
import { useMuiMediaQuery } from "../../mui/index.js";
import { HeaderMenuDesktop } from "./HeaderMenuDesktop.js";
import { HeaderMenuMobile } from "./HeaderMenuMobile.js";
import { type HeaderMenuItem } from "./types.js";

export interface HeaderMenuProps {
  currentPath: string;
  menu: HeaderMenuItem[];
  onMenuItemClick: (m: HeaderMenuItem) => void;
}

const CLASS_PREFIX = "HeaderMenu";
const classes = {
  root: `${CLASS_PREFIX}-root`,
  mobileMenu: `${CLASS_PREFIX}-mobileMenu`,
  mobileMenuIcon: `${CLASS_PREFIX}-mobileMenuIcon`,
  menuItem: `${CLASS_PREFIX}-menuItem`,
  menuItemLink: `${CLASS_PREFIX}-menuItemLink`,
};

const HeaderMenuDiv = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    [`${theme.breakpoints.down("sm")}`]: {
      flexGrow: 1,
    },
  },
}));

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  menu,
  onMenuItemClick,
  currentPath,
}) => {
  const theme = useTheme();

  const isDownMD = useMuiMediaQuery(theme.breakpoints.down("md"));

  const responsiveMenu = React.useMemo(() => {
    // return mobile menu with button icon
    if (isDownMD) {
      return (
        <HeaderMenuMobile
          currentPath={currentPath}
          menu={menu}
          onMenuItemClick={onMenuItemClick}
        />
      );
    }

    return (
      <HeaderMenuDesktop
        currentPath={currentPath}
        menu={menu}
        onMenuItemClick={onMenuItemClick}
      />
    );
  }, [isDownMD, currentPath]);

  return (
    <HeaderMenuDiv className={classes.root}>{responsiveMenu}</HeaderMenuDiv>
  );
};
