import {
  AppBar,
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { Link, navigate } from "@reach/router";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";
import { MattermostIcon } from "../icons/MattermostIcon/MattermostIcon";

const dataMenuItem = {
  id: "dashboards",
  href: "#",
  label: "Dashboards",
  subItems: [
    {
      id: "vaccine-dashboard",
      href: "/dashboards/vaccines",
      label: "Vaccine",
    },
    {
      id: "events-dashboard",
      href: "/dashboards/events",
      label: "Events",
    },
  ],
};

const projectMenuItem = {
  id: "project",
  href: "/project",
  label: "Progetto",
  subItems: [
    {
      id: "the-crisis",
      href: "/the-crisis",
      label: "La Crisi",
    },
    {
      id: "docs",
      href: "/docs",
      label: "Docs",
    },
  ],
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    appBar: {
      backgroundColor: theme.overrides?.MuiAppBar?.colorPrimary as any,
      boxShadow: "none",
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    menuItem: {
      color: theme.palette.common.white,
      fontWeight: theme.typography.fontWeightBold,
    },
    menuItemLink: {
      // color: theme.overrides?.MuiAppBar?.colorPrimary as any,
      textDecoration: "none",
    },
    title: {
      flexGrow: 1,
      margin: 0,
    },
    titleLink: {
      color: theme.palette.common.white,
      fontWeight: theme.typography.fontWeightBold,
      fontFamily: theme.typography.h6.fontFamily,
      letterSpacing: 1.1,
      textDecoration: "none",
    },
  })
);

interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  subItems: Array<Omit<HeaderMenuItem, "subItems">>;
}

export const mainMenu: HeaderMenuItem[] =
  process.env.NODE_ENV === "development"
    ? [
        projectMenuItem,
        {
          id: "blog",
          href: "/blog",
          label: "Blog",
          subItems: [],
        },
        dataMenuItem,
      ]
    : [projectMenuItem, dataMenuItem];

const Header: React.FC = () => {
  const {
    site: {
      siteMetadata: { title, github, communityURL },
    },
  } = {
    site: {
      siteMetadata: {
        title: "ECONNESSIONE",
        github: { repo: "econnessione", user: "ascariandrea" },
        communityURL: "https://community.econnessione.org/",
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
      navigate(m.href);
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
        <Typography variant="h6" className={classes.title}>
          <Link className={classes.titleLink} to="/">
            {title}
          </Link>
        </Typography>

        <a href={communityURL} style={{ verticalAlign: "middle" }}>
          <Button
            startIcon={<MattermostIcon fontSize="small" variant="white" />}
          />
        </a>

        <Button>
          <iframe
            src={`https://ghbtns.com/github-btn.html?user=${github.user}&repo=${github.repo}&type=star&count=true&size=small`}
            frameBorder="0"
            scrolling="0"
            width="100"
            height="20"
            title="GitHub"
            style={{ verticalAlign: "middle" }}
          />
        </Button>
        {mainMenu.map((m) => {
          const buttonRef =
            m.subItems.length > 0
              ? React.useRef<HTMLButtonElement>(null)
              : null;
          return (
            <Button
              key={m.id}
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
                        id={`menu-list-${m.id}`}
                        onKeyDown={handleListKeyDown}
                      >
                        {m.subItems.map((item) => (
                          <MenuItem
                            key={item.id}
                            className={classes.menuItem}
                            onClick={handleClose}
                          >
                            <Link
                              className={classes.menuItemLink}
                              to={item.href}
                            >
                              {item.label}
                            </Link>
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
