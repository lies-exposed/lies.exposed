import * as React from "react";
import {
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from "../../mui/index.js";
import { type HeaderMenuItem } from "./types.js";

interface PopperMenuProps {
  menuItem: HeaderMenuItem;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: (e: MouseEvent | TouchEvent) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLUListElement>;
  onMenuItemClick: (m: HeaderMenuItem) => void;
  classes: {
    menuItem: string;
    menuItemLink: string;
  };
}

export const PopperMenu: React.FC<PopperMenuProps> = ({
  classes,
  menuItem,
  open,
  anchorEl,
  onClose,
  onKeyDown,
  onMenuItemClick,
}) => {
  return (
    <Popper open={open} anchorEl={anchorEl} role={undefined} transition>
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin:
              placement === "bottom" ? "center top" : "center bottom",
          }}
        >
          <Paper
            sx={{
              backgroundColor: "#fff",
              color: "#000",
              minWidth: "200px",
            }}
          >
            <ClickAwayListener
              onClickAway={(e) => {
                onClose(e);
              }}
            >
              <MenuList
                autoFocusItem={open}
                id={`menu-list-${menuItem.view}`}
                onKeyDown={onKeyDown}
              >
                {menuItem.subItems.map((item) => (
                  <MenuItem
                    key={item.view}
                    className={classes.menuItem}
                    onClick={(e) => {
                      onClose(e.nativeEvent);
                      onMenuItemClick({ subItems: [], ...item });
                    }}
                    sx={{
                      color: "#000",
                      backgroundColor: "#fff",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <Typography variant="h6" className={classes.menuItemLink}>
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
  );
};
