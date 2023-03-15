import { type Media } from "@liexp/shared/io/http";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import OpenInFull from "@mui/icons-material/OpenInFull";
import * as React from "react";
import { styled } from "../../theme";
import { Box, IconButton, Modal, Typography } from "../mui";

const PREFIX = "ExpandableImageElement";

const boxClasses = {
  root: `${PREFIX}-root`,
  expandIcon: `${PREFIX}-expand-icon`,
  image: `${PREFIX}-image`,
};

const MODAL_PREFIX = "ExpandableImageElement-modal";
const modalClasses = {
  root: `${MODAL_PREFIX}-root`,
  modalContainer: `${MODAL_PREFIX}-container`,
  paper: `${MODAL_PREFIX}-paper`,
  closeIcon: `${MODAL_PREFIX}-close-icon`,
  image: `${MODAL_PREFIX}-image`,
  expandedDescription: `${MODAL_PREFIX}-expanded-description`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${modalClasses.root}`]: {},
  [`& .${modalClasses.modalContainer}`]: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  [`& .${modalClasses.paper}`]: {
    width: "80%",
    maxHeight: "90%",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  [`& .${modalClasses.closeIcon}`]: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  [`& .${modalClasses.image}`]: {
    width: "100%",
    height: "auto",
    maxHeight: 800,
    objectFit: "cover",
    margin: "auto",
  },
  [`& .${modalClasses.expandedDescription}`]: {
    // color: theme.palette.common.white,
    // background: theme.palette.common.black,
  },
}));

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${boxClasses.image}`]: {
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: 800,
    objectFit: "cover",
    margin: "auto",
  },
  [`& .${boxClasses.expandIcon}`]: {
    position: "absolute",
    right: 0,
    bottom: 0,
  },
}));

interface ExpandableImageElementProps {
  className?: string;
  media: Omit<Media.Media, "type"> & { type: Media.ImageType };
  style?: React.CSSProperties;
  onLoad?: () => void;
  disableZoom?: boolean;
}

const ExpandableImageElement: React.FC<ExpandableImageElementProps> = ({
  media,
  className,
  style,
  onLoad,
  disableZoom = false,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <StyledBox
      className={className}
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <img
        className={boxClasses.image}
        src={media.location}
        style={style}
        onLoad={onLoad}
        loading="lazy"
      />
      {!disableZoom ? (
        <IconButton
          className={boxClasses.expandIcon}
          aria-label="expand"
          onClick={(e) => {
            setOpen(true);
          }}
          size="large"
        >
          <OpenInFull />
        </IconButton>
      ) : null}

      {!disableZoom ? (
        <StyledModal
          className={modalClasses.root}
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <div className={modalClasses.modalContainer}>
            <div className={modalClasses.paper}>
              <Box
                display={"flex"}
                flexDirection="column"
                style={{ position: "relative", height: "100%" }}
              >
                <Box className={modalClasses.closeIcon}>
                  <CloseOutlined
                    onClick={() => {
                      setOpen(false);
                    }}
                  />
                </Box>

                <Box
                  id="alert-dialog-description"
                  display={"flex"}
                  width="100%"
                  height="100%"
                  style={{
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <img
                    className={modalClasses.image}
                    src={media.location}
                    loading="lazy"
                    role="img"
                  />
                  <Typography
                    id="alert-dialog-title"
                    variant="subtitle2"
                    className={modalClasses.expandedDescription}
                  >
                    {media.description}
                  </Typography>
                </Box>
              </Box>
            </div>
          </div>
        </StyledModal>
      ) : null}
    </StyledBox>
  );
};

export default ExpandableImageElement;
