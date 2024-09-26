import { clsx } from "clsx";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { Button, Stack } from "../../mui/index.js";
import { PopperMenu } from "./PopperMenu.js";
import { type HeaderMenuItem } from "./types.js";

const HeaderMenuItemFC: React.FC<{
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

export interface HeaderMenuProps {
  currentPath: string;
  menu: HeaderMenuItem[];
  onMenuItemClick: (m: HeaderMenuItem) => void;
}

const CLASS_PREFIX = "HeaderMenuDesktop";
const classes = {
  root: `${CLASS_PREFIX}-root`,
  menuItem: `${CLASS_PREFIX}-menuItem`,
  menuItemLink: `${CLASS_PREFIX}-menuItemLink`,
};

const HeaderMenuDesktopDiv = styled("div")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  [`& .${classes.menuItem}`]: {
    color: theme.palette.common.white,
    ...theme.typography.subtitle1,
    fontWeight: theme.typography.fontWeightBold,
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
}));

export const HeaderMenuDesktop: React.FC<HeaderMenuProps> = ({
  menu,
  onMenuItemClick,
  currentPath,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [selectedMenuItem, setSelectedMenuItem] =
    React.useState<HeaderMenuItem | null>(null);

  const handleToggle = (
    ref: React.RefObject<HTMLButtonElement> | null,
    m: HeaderMenuItem,
  ): void => {
    if (m.subItems.length > 0) {
      setAnchorEl(ref?.current ?? null);
      setSelectedMenuItem(m);
    } else {
      onMenuItemClick(m);
    }
  };

  const handleClose = (event: React.MouseEvent | React.TouchEvent): void => {
    if (anchorEl?.contains(event.target as HTMLElement)) {
      return;
    }

    setAnchorEl(null);
  };

  function handleListKeyDown(
    event: React.KeyboardEvent<HTMLUListElement>,
  ): void {
    if (event.key === "Tab") {
      event.preventDefault();
      setAnchorEl(null);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect((): void => {
    if (prevOpen.current && !open && anchorEl) {
      anchorEl.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const menuItems = React.useMemo(() => {
    return menu.map((m) => {
      return (
        <HeaderMenuItemFC
          key={m.view}
          item={m}
          className={classes.menuItem}
          currentView={currentPath}
          open={open}
          onClick={handleToggle}
        />
      );
    });
  }, [currentPath]);

  return (
    <HeaderMenuDesktopDiv className={classes.root}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        {menuItems}
      </Stack>
      {pipe(
        O.fromNullable(selectedMenuItem),
        O.map((m): JSX.Element | null => (
          // eslint-disable-next-line react/jsx-key
          <PopperMenu
            classes={{
              menuItem: classes.menuItem,
              menuItemLink: classes.menuItemLink,
            }}
            menuItem={m}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            onKeyDown={handleListKeyDown}
            onMenuItemClick={onMenuItemClick}
          />
        )),
        O.toNullable,
      )}
    </HeaderMenuDesktopDiv>
  );
};
