import * as React from "react";
import { useTheme } from "../../../theme/index.js";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  Icons,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "../../mui/index.js";
import { type HeaderMenuItem, type HeaderMenuSubItem } from "./types.js";

export interface HeaderMenuProps {
  currentPath: string;
  menu: HeaderMenuItem[];
  onMenuItemClick: (m: HeaderMenuSubItem) => void;
  /** Optional content rendered at the bottom of the drawer (e.g. donate/social) */
  drawerFooter?: React.ReactNode;
}

export const HeaderMenuMobile: React.FC<HeaderMenuProps> = ({
  menu,
  onMenuItemClick,
  currentPath,
  drawerFooter,
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setExpandedItem(null);
  };

  const handleItemClick = (item: HeaderMenuItem): void => {
    if (item.subItems.length > 0) {
      setExpandedItem(expandedItem === item.view ? null : item.view);
    } else {
      onMenuItemClick(item);
      handleClose();
    }
  };

  const handleSubItemClick = (sub: HeaderMenuSubItem): void => {
    onMenuItemClick(sub);
    handleClose();
  };

  const isSelected = (item: HeaderMenuItem): boolean =>
    item.view === currentPath ||
    item.subItems.some((s) => s.view === currentPath);

  return (
    <>
      <IconButton
        aria-label="open navigation menu"
        onClick={handleOpen}
        size="large"
        edge="end"
        sx={{ color: theme.palette.common.white }}
      >
        <Icons.MenuIcon />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              width: "min(82vw, 300px)",
              display: "flex",
              flexDirection: "column",
              top: 48,
              height: "calc(100vh - 48px)",
            },
          },
        }}
      >
        {/* Nav items */}
        <List sx={{ flexGrow: 1, pt: 0 }}>
          {menu.map((item) => {
            const selected = isSelected(item);
            const expanded = expandedItem === item.view;

            return (
              <React.Fragment key={item.view}>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    handleItemClick(item);
                  }}
                  sx={{
                    minHeight: 52,
                    borderLeft: selected
                      ? `3px solid ${theme.palette.secondary.main}`
                      : "3px solid transparent",
                    pl: selected ? "13px" : 2,
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: selected
                            ? theme.typography.fontWeightBold
                            : theme.typography.fontWeightRegular,
                          fontSize: "0.9375rem",
                        },
                      },
                    }}
                  />
                  {item.subItems.length > 0 && (
                    <ListItemIcon sx={{ minWidth: 0 }}>
                      <Icons.ExpandMore
                        sx={{
                          transition: "transform 0.2s",
                          transform: expanded
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          fontSize: "1.25rem",
                          color: theme.palette.text.secondary,
                        }}
                      />
                    </ListItemIcon>
                  )}
                </ListItemButton>

                {item.subItems.length > 0 && (
                  <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {item.subItems.map((sub) => {
                        const subSelected = sub.view === currentPath;
                        return (
                          <ListItemButton
                            key={sub.view}
                            selected={subSelected}
                            onClick={() => {
                              handleSubItemClick(sub);
                            }}
                            sx={{
                              minHeight: 44,
                              pl: 4,
                              borderLeft: subSelected
                                ? `3px solid ${theme.palette.secondary.main}`
                                : "3px solid transparent",
                            }}
                          >
                            <ListItemText
                              primary={sub.label}
                              slotProps={{
                                primary: {
                                  sx: {
                                    fontSize: "0.875rem",
                                    color: subSelected
                                      ? theme.palette.primary.main
                                      : theme.palette.text.secondary,
                                  },
                                },
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>

        {/* Drawer footer: social links / donate */}
        {drawerFooter != null && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 2 }}>{drawerFooter}</Box>
          </>
        )}
      </Drawer>
    </>
  );
};
