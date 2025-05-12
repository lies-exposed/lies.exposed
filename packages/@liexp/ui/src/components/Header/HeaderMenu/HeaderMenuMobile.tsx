import { clsx } from "clsx";
import * as React from "react";
import { styled, useTheme } from "../../../theme/index.js";
import {
  Box,
  Button,
  Icons,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "../../mui/index.js";
import { type HeaderMenuItem, type HeaderMenuSubItem } from "./types.js";

interface HeaderMenuItemProps {
  item: HeaderMenuItem;
  selectedItem: HeaderMenuItem | null;
  open: boolean;
  currentView: string;
  onClick: (
    ref: React.RefObject<HTMLButtonElement | null> | null,
    i: HeaderMenuItem | HeaderMenuSubItem,
  ) => void;
}

const MENU_ITEM_CLASS_PREFIX = "HeaderMenu";
const menuItemClasses = {
  root: `${MENU_ITEM_CLASS_PREFIX}-root`,
  menuItem: `${MENU_ITEM_CLASS_PREFIX}-menuItem`,
  menuItemLink: `${MENU_ITEM_CLASS_PREFIX}-menuItemLink`,
  menuSubItems: `${MENU_ITEM_CLASS_PREFIX}-menuSubItems`,
};

const HeaderMenuItemBox = styled(Box)(({ theme }) => ({
  [`&.${menuItemClasses.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  [`& .${menuItemClasses.menuItemLink}`]: {
    color: theme.palette.text.primary,
    ...theme.typography.subtitle1,
    fontSize: 14,
    margin: 0,
  },
  [`& .${menuItemClasses.menuSubItems}`]: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
}));

const HeaderMenuItemFC: React.FC<HeaderMenuItemProps> = ({
  item: m,
  selectedItem,
  open,
  currentView,
  onClick,
}) => {
  const buttonRef =
    m.subItems.length > 0 ? React.useRef<HTMLButtonElement>(null) : null;

  const selected =
    m.view === currentView || m.subItems.some((i) => i.view === currentView);

  const showSubMenu = (selectedItem && selectedItem.view === m.view) ?? false;

  return (
    <HeaderMenuItemBox className={menuItemClasses.root}>
      <Button
        key={m.view}
        className={clsx(menuItemClasses.menuItem, {
          selected,
        })}
        ref={buttonRef}
        aria-controls={open ? "menu-list-grow" : undefined}
        aria-haspopup="true"
        onClick={() => {
          if (buttonRef) {
            onClick(buttonRef, m);
          }
        }}
      >
        {m.label}
      </Button>
      {showSubMenu && (
        <Stack flexDirection={"row"} className={menuItemClasses.menuSubItems}>
          {m.subItems.map((i) => {
            return (
              <MenuItem
                key={i.view}
                onClick={() => {
                  onClick(null, i);
                }}
              >
                {i.label}
              </MenuItem>
            );
          })}
        </Stack>
      )}
    </HeaderMenuItemBox>
  );
};

export interface HeaderMenuProps {
  currentPath: string;
  menu: HeaderMenuItem[];
  onMenuItemClick: (m: HeaderMenuSubItem) => void;
}

const MENU_CLASS_PREFIX = "HeaderMenu";
const menuClasses = {
  root: `${MENU_CLASS_PREFIX}-root`,
  mobileMenu: `${MENU_CLASS_PREFIX}-mobileMenu`,
  mobileMenuIcon: `${MENU_CLASS_PREFIX}-mobileMenuIcon`,
  menuItemLink: `${MENU_CLASS_PREFIX}-menuItemLink`,
};

const HeaderMenuMobileDiv = styled("div")(({ theme }) => ({
  [`&.${menuClasses.root}`]: {
    display: "flex",
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  [`& .${menuClasses.mobileMenu}`]: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    maxWidth: 350,
    padding: 20,
  },
  [`& .${menuClasses.mobileMenuIcon}`]: {
    margin: 0,
  },
}));

export const HeaderMenuMobile: React.FC<HeaderMenuProps> = ({
  menu,
  onMenuItemClick,
  currentPath,
}) => {
  const theme = useTheme();

  const [anchorRef, setAnchorRef] = React.useState<
    React.RefObject<HTMLButtonElement | null>
  >(React.createRef<HTMLButtonElement>());

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const [selectedMenuItem, setSelectedMenuItem] =
    React.useState<HeaderMenuItem | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleToggle = (
    ref: React.RefObject<HTMLButtonElement | null> | null,
    m: HeaderMenuItem | HeaderMenuSubItem,
  ): void => {
    const item = m;

    if ("subItems" in item) {
      if (ref) {
        setAnchorRef(ref);
      }
      setSelectedMenuItem(item);
    } else {
      onMenuItemClick(item);
      setSelectedMenuItem(null);
      setAnchorEl(null);
    }
  };

  const handleClose = (event: React.MouseEvent | React.TouchEvent): void => {
    if (anchorRef?.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setAnchorEl(null);
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect((): void => {
    if (prevOpen.current && !open && anchorRef) {
      anchorRef.current?.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <HeaderMenuMobileDiv className={menuClasses.root}>
      <Box>
        <IconButton
          aria-label="more"
          id="mobile-menu-icon-button"
          className={clsx(menuClasses.mobileMenuIcon)}
          aria-controls={open ? "mobile-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <Icons.MoreVert
            style={{
              color: theme.palette.common.white,
            }}
          />
        </IconButton>
        <Menu
          id="mobile-menu"
          MenuListProps={{
            "aria-labelledby": "mobile-menu-icon-button",
          }}
          className={menuClasses.mobileMenu}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              style: {
                maxHeight: 48 * 6,
                width: "30ch",
              },
            },
          }}
        >
          {menu.map((m) => {
            return (
              <HeaderMenuItemFC
                key={m.view}
                item={m}
                selectedItem={selectedMenuItem}
                currentView={currentPath}
                open={open}
                onClick={handleToggle}
              />
            );
          })}
        </Menu>
      </Box>
    </HeaderMenuMobileDiv>
  );
};
