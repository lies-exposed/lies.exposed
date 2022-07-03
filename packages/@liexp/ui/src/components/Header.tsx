import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { styled } from "../theme";
import DonateButton from "./Common/Button/DonateButton";
import { TelegramIcon } from "./Common/Icons";
import GithubButton from "./GithubButton";
import {
  AppBar,
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
  root: `${PREFIX}-root`,
  appBar: `${PREFIX}-appBar`,
  menuButton: `${PREFIX}-menuButton`,
  menuItem: `${PREFIX}-menuItem`,
  menuItemLink: `${PREFIX}-menuItemLink`,
  title: `${PREFIX}-title`,
  titleLink: `${PREFIX}-titleLink`,
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  [`& .${classes.root}`]: {
    flexGrow: 0,
    flexShrink: 0,
  },

  [`&.${classes.appBar}`]: {
    position: "fixed",
    boxShadow: "none",
    zIndex: theme.zIndex.drawer + 1,
    flexGrow: 0,
    maxHeight: 64,
  },

  [`& .${classes.menuButton}`]: {
    marginRight: theme.spacing(2),
  },

  [`& .${classes.menuItem}`]: {
    color: theme.palette.common.white,
    ...(theme.typography.subtitle1 as any),
  },

  [`& .${classes.menuItemLink}`]: {
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightBold as any,
    textTransform: "uppercase",
    ...(theme.typography.subtitle1 as any),
    fontSize: 14,
    margin: 0,
  },

  [`& .${classes.title}`]: {
    flexGrow: 1,
    margin: 0,
    color: theme.palette.common.white,
    fontWeight: theme.typography.fontWeightBold as any,
    cursor: 'pointer'
  },

  [`& .${classes.titleLink}`]: {
    color: theme.palette.common.black,
    fontWeight: theme.typography.fontWeightBold as any,
    fontFamily: theme.typography.h6.fontFamily,
    letterSpacing: 1.1,
    textDecoration: "none",
  },
}));

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

  const handleClose = (event: React.MouseEvent | React.TouchEvent): void => {
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
    <StyledAppBar className={classes.appBar} position="fixed">
      <Toolbar>
        <Typography
          variant="h6"
          className={classes.title}
          onClick={() => onTitleClick()}
        >
          {title}
        </Typography>

        <DonateButton className={classes.menuItem} />
        <Link href={telegram.href} target="_blank" style={{ display: "flex" }}>
          <TelegramIcon size="1x" className={classes.menuItem} />
        </Link>
        <GithubButton className={classes.menuItem} {...github} />
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
                    <ClickAwayListener
                      onClickAway={(e) => handleClose(e as any)}
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
          O.toNullable
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
