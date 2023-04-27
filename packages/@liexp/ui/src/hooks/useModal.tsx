import * as React from "react";
import { Modal } from "../components/Common/Modal";
import { Box, IconButton, CloseIcon } from "../components/mui";
import { styled } from "../theme";

const PREFIX = "modal";

const classes = {
  modal: `${PREFIX}`,
  paper: `${PREFIX}-paper`,
  closeIconBox: `${PREFIX}-close-icon-box`,
  content: `${PREFIX}-content`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.modal}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
  [`& .${classes.paper}`]: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    // margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
  },
  [`& .${classes.closeIconBox}`]: {
    display: "flex",
    alignSelf: "flex-end",
  },
  [`& .${classes.content}`]: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
}));

export const useModal = (): [
  React.ReactElement | null,
  (title: string, getContent: (onClose: () => void) => JSX.Element) => void
] => {
  const [modalState, setModalState] = React.useState<{
    title?: string;
    open: boolean;
    content: React.ReactElement | null;
  }>({
    title: undefined,
    open: false,
    content: null,
  });

  const onClose = React.useCallback((): void => {
    setModalState((m) => ({ ...m, open: false }));
  }, []);

  const modal = React.useMemo(() => {
    const { title, content, open } = modalState;
    if (!open || content === null) {
      return null;
    }

    return (
      <StyledModal
        className={classes.modal}
        open={open}
        onClose={onClose}
        title={title}
        disablePortal={true}
      >
        <Box className={classes.content}>
          <Box className={classes.closeIconBox}>
            <IconButton
              aria-label="Close"
              color="secondary"
              size="small"
              style={{ margin: 0 }}
              onClick={() => {
                onClose();
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {content}
        </Box>
      </StyledModal>
    );
  }, [modalState, onClose]);

  const showModal = (
    title: string,
    getContent: (onClose: () => void) => JSX.Element
  ): void => {
    setModalState({
      title,
      open: true,
      content: getContent(onClose),
    });
  };
  return [modal, showModal];
};
