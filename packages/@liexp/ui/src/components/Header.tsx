import { clsx } from "clsx";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { styled } from "../theme";
import DonateButton from "./Common/Button/DonateButton";
import SuggestLinkButton from "./Common/Button/SuggestLinkButton";
import { TelegramIcon } from "./Common/Icons";
import GithubButton from "./GithubButton";
import {
  AppBar,
  Box,
  Button,
  ClickAwayListener,
  Grow,
  Link,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Toolbar,
  Typography,
} from "./mui";

const PREFIX = "Header";

const classes = {
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
    fontWeight: theme.typography.fontWeightBold as any,
    cursor: "pointer",
  },

  [`& .${classes.titleLink}`]: {
    color: theme.palette.common.black,
    fontWeight: theme.typography.fontWeightBold as any,
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
    },
  },
  [`& .${classes.menuItem}`]: {
    color: theme.palette.common.white,
    ...(theme.typography.subtitle1 as any),
    fontWeight: theme.typography.fontWeightBold as any,
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
    ...(theme.typography.subtitle1 as any),
    // fontWeight: theme.typography.fontWeightBold as any,
    fontSize: 14,
    margin: 0,
  },
  [`& .${classes.menuButton}`]: {
    marginRight: theme.spacing(2),
  },
}));

interface View {
  view: string;
  search?: Record<string, any>;
}

export interface HeaderMenuItem extends View {
  label: React.ReactNode;
  subItems: Array<Omit<HeaderMenuItem, "subItems">>;
}

const HeaderMenuItem: React.FC<{
  item: HeaderMenuItem;
  className?: string;
  open: boolean;
  currentView: string;
  onClick: (
    ref: React.RefObject<HTMLButtonElement> | null,
    i: HeaderMenuItem,
  ) => void;
}> = ({ item: m, className, open, currentView, onClick }) => {
  const buttonRef =
    m.subItems.length > 0 ? React.useRef<HTMLButtonElement>(null) : null;

  const selected =
    m.view === currentView || m.subItems.some((i) => i.view === currentView);

  return (
    <Button
      key={m.view}
      className={clsx(className, {
        selected,
      })}
      ref={buttonRef}
      aria-controls={open ? "menu-list-grow" : undefined}
      aria-haspopup="true"
      onClick={() => {
        onClick(buttonRef, m);
      }}
    >
      {m.label}
    </Button>
  );
};

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

  const [open, setOpen] = React.useState(false);
  const [anchorRef, setAnchorRef] =
    React.useState<React.RefObject<HTMLButtonElement> | null>(
      React.useRef<HTMLButtonElement>(null),
    );
  const [selectedMenuItem, setSelectedMenuItem] =
    React.useState<HeaderMenuItem | null>(null);

  const handleToggle = (
    ref: React.RefObject<HTMLButtonElement> | null,
    m: HeaderMenuItem,
  ): void => {
    if (m.subItems.length > 0) {
      setOpen((prevOpen) => !prevOpen);
      setAnchorRef(ref);
      setSelectedMenuItem(m);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      onMenuItemClick(m);
    }
  };

  const handleClose = (event: React.MouseEvent | React.TouchEvent): void => {
    if (anchorRef?.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(
    event: React.KeyboardEvent<HTMLUListElement>,
  ): void {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect((): void => {
    if (prevOpen.current && !open && anchorRef) {
      anchorRef.current?.focus();
    }

    prevOpen.current = open;
  }, [open]);

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

        {menu.map((m) => {
          return (
            <HeaderMenuItem
              key={m.view}
              item={m}
              className={classes.menuItem}
              currentView={pathname}
              open={open}
              onClick={handleToggle}
            />
          );
        })}

        {pipe(
          O.fromNullable(selectedMenuItem),
          O.map((m): JSX.Element | null => (
            // eslint-disable-next-line react/jsx-key
            <Popper
              open={open}
              anchorEl={anchorRef?.current}
              role={undefined}
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom" ? "center top" : "center bottom",
                  }}
                >
                  <Paper>
                    <ClickAwayListener
                      onClickAway={(e) => {
                        handleClose(e as any);
                      }}
                    >
                      <MenuList
                        autoFocusItem={open}
                        id={`menu-list-${m.view}`}
                        onKeyDown={handleListKeyDown}
                      >
                        {m.subItems.map((item) => (
                          <MenuItem
                            key={item.view}
                            className={classes.menuItem}
                            onClick={(e) => {
                              handleClose(e as any);
                              onMenuItemClick({ subItems: [], ...item });
                            }}
                          >
                            <Typography
                              variant="h6"
                              className={classes.menuItemLink}
                            >
                              {item.label}
                            </Typography>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          )),
          O.toNullable,
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
