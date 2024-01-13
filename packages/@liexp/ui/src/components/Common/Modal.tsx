import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import {
  Modal as MUIModal,
  type ModalProps as MUIModalProps,
} from "../mui/index.js";

const MODAL_PREFIX = "modal";

const classes = {
  root: `${MODAL_PREFIX}-root`,
  container: `${MODAL_PREFIX}-container`,
  paper: `${MODAL_PREFIX}-paper`,
};
interface ModalProps extends MUIModalProps {}

const StyledModal = styled(MUIModal)(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.container}`]: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [`& .${classes.paper}`]: {
      width: "80%",
      minHeight: 400,
      maxHeight: "90%",
      height: "100%",
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(2),
    },
  },
})) as typeof MUIModal;

export const Modal: React.FC<ModalProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <StyledModal {...props} className={clsx(classes.root, className)}>
      <div className={classes.container}>
        <div className={classes.paper}>{children}</div>
      </div>
    </StyledModal>
  );
};
