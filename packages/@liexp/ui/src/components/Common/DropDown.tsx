import { clsx } from "clsx";
import * as React from "react";
import ReactDOM from "react-dom";
import { styled } from "../../theme";
import {
  Box,
  Button,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  type MenuItemProps,
} from "../mui";

const PREFIX = `dropdown`;
const classes = {
  button: `${PREFIX}-button`,
  menu: `${PREFIX}-menu`,
  menuItem: `${PREFIX}-menu-item`,
  menuItemIcon: `${PREFIX}-menu-item-icon`,
  menuItemText: `${PREFIX}-menu-item-text`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  maxWidth: 150,
  [`& .${classes.button}`]: {
    display: "flex",
    alignItems: "center",
    color: theme.palette.common.black,
  },
  [`& .${classes.menuItem}`]: {},
  [`& .${classes.menuItemIcon}`]: {
    marginRight: 10,
  },
}));

interface DropDownItemProps extends MenuItemProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const DropDownItem: React.FC<DropDownItemProps> = ({
  className,
  icon,
  children,
  ...props
}) => {
  return (
    <MenuItem {...props} className={clsx(classes.menuItem, className)}>
      {icon ? <span className={classes.menuItemIcon}>{icon}</span> : null}
      {children}
    </MenuItem>
  );
};

type OnCloseFn = (
  ev: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
) => void;

export interface DropDownProps {
  label: React.ReactElement | React.ReactNode;
  className?: string;
  open?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: (props: { onClose: OnCloseFn }) => React.ReactElement;
}

export const DropDown: React.FC<DropDownProps> = ({
  label,
  className,
  open: _open = false,
  disabled = false,
  icon,
  children,
}) => {
  const boxRef = React.useRef(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(_open);
  const prevOpen = React.useRef(open);

  const handleClose: OnCloseFn = (event) => {
    if (buttonRef.current?.contains(event.target as HTMLElement)) {
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

  const items = React.useMemo(() => {
    return children({ onClose: handleClose });
  }, []);

  React.useEffect((): void => {
    if (prevOpen.current && !open && buttonRef) {
      buttonRef.current?.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <StyledBox
      className={clsx(className, {
        disabled,
      })}
      ref={boxRef}
    >
      <Button
        className={clsx(classes.button, {
          selected: open,
        })}
        startIcon={icon}
        size="small"
        ref={buttonRef}
        aria-controls={open ? "menu-list-grow" : undefined}
        aria-haspopup="true"
        onClick={() => {
          setOpen(true);
        }}
      >
        {label}
      </Button>
      {open &&
        boxRef.current &&
        ReactDOM.createPortal(
          // eslint-disable-next-line react/jsx-key
          <Popper
            open={open}
            anchorEl={buttonRef?.current}
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
                      handleClose(e);
                    }}
                  >
                    <MenuList
                      autoFocusItem={open}
                      onKeyDown={handleListKeyDown}
                    >
                      {items}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>,
          boxRef.current
        )}
    </StyledBox>
  );
};
