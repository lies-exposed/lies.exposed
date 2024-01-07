import * as React from "react";
import { styled } from "../../theme";
import DonateButton from "../Common/Button/DonateButton";
import SuggestLinkButton from "../Common/Button/SuggestLinkButton";
import { TelegramIcon } from "../Common/Icons";
import GithubButton from "../GithubButton";
import {
  AppBar,
  Box,
  Link,
  Toolbar,
  Typography
} from "../mui";
import { HeaderMenu } from './HeaderMenu/HeaderMenu';
import { type HeaderMenuItem } from './HeaderMenu/types';

const PREFIX = "Header";

export const classes = {
  appBar: `${PREFIX}-appBar`,
  logo: `${PREFIX}-logo`,
  menuButton: `${PREFIX}-menuButton`,
  menuItem: `${PREFIX}-menuItem`,
  menuLeft: `${PREFIX}-menuLeft`,
  menuItemLink: `${PREFIX}-menuItemLink`,
  title: `${PREFIX}-title`,
  titleLink: `${PREFIX}-titleLink`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [`&.${classes.appBar}`]: {
    position: "fixed",
    boxShadow: "none",
    zIndex: theme.zIndex.drawer + 1,
    flexGrow: 0,
    maxHeight: 64,
  },
  [`& .${classes.logo}`]: {
    padding: 10,
    height: 64,
    [`${theme.breakpoints.down("sm")}`]: {
      height: 48,
    },
  },
  [`& .${classes.title}`]: {
    margin: 0,
    marginRight: theme.spacing(2),
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold ,
    cursor: "pointer",
    [`${theme.breakpoints.down("sm")}`]: {
      fontSize: 12
    }
  },

  [`& .${classes.titleLink}`]: {
    color: theme.palette.common.black,
    fontWeight: theme.typography.fontWeightBold ,
    fontFamily: theme.typography.h6.fontFamily,
    letterSpacing: 1.1,
    textDecoration: "none",
  },
  [`& .${classes.menuLeft}`]: {
    display: "flex",
    alignContent: "flex-start",
    alignItems: "center",
    flexGrow: 1,
    [`${theme.breakpoints.down("sm")}`]: {
      display: "none",
      flexGrow: 1
    },
  },
  [`& .${classes.menuItem}`]: {
    color: theme.palette.common.white,
    ...(theme.typography.subtitle1 ),
    fontWeight: theme.typography.fontWeightBold ,
    fontSize: 16,
    textTransform: "none",
    cursor: "pointer",
    "&.selected": {
      color: theme.palette.common.white,
      borderRadius: "0",
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
  },
  [`& .${classes.menuItemLink}`]: {
    color: theme.palette.text.primary,
    ...(theme.typography.subtitle1 ),
    // fontWeight: theme.typography.fontWeightBold as any,
    fontSize: 14,
    margin: 0,
  },
  [`& .${classes.menuButton}`]: {
    marginRight: theme.spacing(2),
  },
}));



export interface HeaderProps {
  logoSrc?: string;
  onTitleClick: () => void;
  onMenuItemClick: (m: HeaderMenuItem) => void;
  menu: HeaderMenuItem[];
  pathname: string;
}

const Header: React.FC<HeaderProps> = ({
  logoSrc,
  pathname,
  onTitleClick,
  onMenuItemClick,
  menu,
}) => {
  const {
    site: {
      siteMetadata: { title, github, telegram },
    },
  } = {
    site: {
      siteMetadata: {
        title: "lies.exposed",
        github: { user: "lies-exposed", repo: "lies.exposed" },
        telegram: { href: "https://t.me/lies_exposed" },
      },
    },
  };

  return (
    <StyledAppBar className={classes.appBar} position="fixed">
      <Toolbar>
        {logoSrc ? <img className={classes.logo} src={logoSrc} /> : null}
        <Typography
          variant="h6"
          className={classes.title}
          onClick={() => {
            onTitleClick();
          }}
        >
          {title}
        </Typography>
        <Box className={classes.menuLeft}>
          <GithubButton className={classes.menuItem} {...github} />
          <Link
            className={classes.menuItem}
            href={telegram.href}
            target="_blank"
            style={{ display: "flex" }}
          >
            <TelegramIcon size="1x" className={classes.menuItem} />
          </Link>
          <Box style={{ display: "flex", marginLeft: 10 }}>
            <DonateButton className={classes.menuItem} />
          </Box>
        </Box>

        <SuggestLinkButton className={classes.menuItem} color={"white"} />

        <HeaderMenu
          menu={menu}
          onMenuItemClick={onMenuItemClick}
          currentPath={pathname}
        />
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
