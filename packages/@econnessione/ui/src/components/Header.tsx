import {
  AppBar,
  Button,
  ClickAwayListener,
  createStyles,
  Grow,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ECOTheme } from "../theme/index";
import DonateButton from "./Common/Button/DonateButton";
import GithubButton from "./GithubButton";

const useStyles = makeStyles<ECOTheme>((theme) =>
  createStyles({
    root: {
      flexGrow: 0,
      flexShrink: 0
    },
    appBar: {
      backgroundColor: theme.overrides?.MuiAppBar?.colorPrimary as any,
      boxShadow: "none",
      zIndex: theme.zIndex.drawer + 1,
      flexGrow: 0,
      maxHeight: 64
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    menuItem: {
      color: theme.palette.common.white,
      fontWeight: theme.typography.fontWeightBold as any,
    },
    menuItemLink: {
      color: theme.palette.text.primary,
      fontWeight: theme.typography.fontWeightBold as any,
      textTransform: "uppercase",
      margin: 0,
    },
    title: {
      flexGrow: 1,
      margin: 0,
      color: theme.palette.common.white,
      fontWeight: theme.typography.fontWeightBold as any,
    },
    titleLink: {
      color: theme.palette.common.black,
      fontWeight: theme.typography.fontWeightBold as any,
      fontFamily: theme.typography.h6.fontFamily,
      letterSpacing: 1.1,
      textDecoration: "none",
    },
  })
);

interface View {
  view: string;
  search?: { [key: string]: any };
}

export interface HeaderMenuItem extends View {
  label: string;
  subItems: Array<Omit<HeaderMenuItem, "subItems">>;
}

export interface HeaderProps {
  onTitleClick: () => void;
  onMenuItemClick: (m: HeaderMenuItem) => void;
  menu: HeaderMenuItem[];
}

const Header: React.FC<HeaderProps> = ({
  onTitleClick,
  onMenuItemClick,
  menu,
}) => {
  const {
    site: {
      siteMetadata: { title, github },
    },
  } = {
    site: {
      siteMetadata: {
        title: "lies.exposed",
        github: { user: "lies-exposed", repo: "lies.exposed" },
        // communityURL: "https://community.econnessione.org/",
      },
    },
  };

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [anchorRef, setAnchorRef] =
    React.useState<React.RefObject<HTMLButtonElement> | null>(
      React.useRef<HTMLButtonElement>(null)
    );
  const [selectedMenuItem, setSelectedMenuItem] =
    React.useState<HeaderMenuItem | null>(null);

  const handleToggle = (
    ref: React.RefObject<HTMLButtonElement> | null,
    m: HeaderMenuItem
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

  const handleClose = (event: React.MouseEvent<EventTarget>): void => {
    if (anchorRef?.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(
    event: React.KeyboardEvent<HTMLUListElement>
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
    <AppBar className={classes.appBar} position="relative">
      <Toolbar>
        <Typography
          variant="h6"
          className={classes.title}
          onClick={() => onTitleClick()}
        >
          {title}
        </Typography>

        <DonateButton />
        <GithubButton {...github} />
        {menu.map((m) => {
          const buttonRef =
            m.subItems.length > 0
              ? React.useRef<HTMLButtonElement>(null)
              : null;
          return (
            <Button
              key={m.view}
              className={classes.menuItem}
              ref={buttonRef}
              aria-controls={open ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={() => handleToggle(buttonRef, m)}
            >
              {m.label}
            </Button>
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
                    <ClickAwayListener onClickAway={handleClose}>
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
                              handleClose(e);
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
          O.toNullable
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
