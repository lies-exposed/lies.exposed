import * as React from "react";
import { apiClient } from "../../providers/EndpointsRESTClient/EndpointsRESTClient";
import { styled } from "../../theme";
import LinkPreview from "../admin/previews/LinkPreview";
import { Box, Button, CloseIcon, IconButton, Input, Modal } from "../mui";

const EVENT_SLIDER_MODAL_PREFIX = "event-slider-modal";

const classes = {
  modal: `${EVENT_SLIDER_MODAL_PREFIX}-modal`,
  paper: `${EVENT_SLIDER_MODAL_PREFIX}-paper`,
  closeIconBox: `${EVENT_SLIDER_MODAL_PREFIX}-close-icon-box`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.modal}`]: {
    display: "flex",
    flexDirection: "column",
    width: "40%",
    margin: "10% auto",
  },
  [`& .${classes.paper}`]: {
    display: "flex",
    flexDirection: "column",
    minHeight: "30%",
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
  },
  [`& .${classes.closeIconBox}`]: {
    display: "flex",
    alignSelf: "flex-end",
  },
}));

export interface SuggestLinkModalProps {
  open?: boolean;
  onClose: () => void;
}

export const SuggestLinkModal: React.FC<SuggestLinkModalProps> = ({
  open,
  onClose,
  ...props
}) => {
  const [url, setUrl] = React.useState("");
  const [link, setLink] = React.useState<any>(undefined);

  const handleURLSubmission = (): void => {
    void apiClient
      .create("/links/submit", { data: { url } })
      .then(({ data }) => {
        setLink(data);
      });
  };
  return (
    <StyledModal
      className={classes.modal}
      open={open ?? false}
      onClose={() => {
        setLink(undefined);
        setUrl("");
        onClose();
      }}
    >
      <Box className={classes.paper}>
        <Box className={classes.closeIconBox}>
          <IconButton
            aria-label="Close"
            color="secondary"
            size="small"
            style={{ margin: 0 }}
            onClick={() => {
              setUrl("");
              setLink(undefined);
              onClose();
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {!link ? (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Input
              style={{ width: "100%", marginBottom: 30 }}
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
              }}
              onSubmit={() => {
                handleURLSubmission();
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                handleURLSubmission();
              }}
            >
              Search
            </Button>
          </Box>
        ) : (
          <Box style={{ marginTop: 50 }}>
            <LinkPreview record={link} />
            <Button
              onClick={() => {
                setLink(undefined);
                setUrl("");
              }}
            >
              Submit another link
            </Button>
          </Box>
        )}
      </Box>
    </StyledModal>
  );
};
