import { type Media } from "@liexp/shared/lib/io/http";
import OpenInFull from "@mui/icons-material/OpenInFull";
import * as React from "react";
import { useModal } from "../../hooks/useModal";
import { styled } from "../../theme";
import { Box, IconButton, Typography } from "../mui";

const MODAL_PREFIX = "ExpandableImageElement-modal";
const modalClasses = {
  root: `${MODAL_PREFIX}-root`,
  image: `${MODAL_PREFIX}-image`,
  expandedDescription: `${MODAL_PREFIX}-expanded-description`,
};

const StyledModalContent = styled(Box)(({ theme }) => ({
  [`& .${modalClasses.root}`]: {
    position: "absolute",
  },
  [`& .${modalClasses.image}`]: {
    width: "auto",
    maxWidth: "100%",
    height: "100%",
    maxHeight: 800,
    objectFit: "cover",
    margin: "auto",
  },
  [`& .${modalClasses.expandedDescription}`]: {
    // color: theme.palette.common.white,
    // background: theme.palette.common.black,
  },
}));

const PREFIX = "ExpandableImageElement";

const boxClasses = {
  root: `${PREFIX}-root`,
  expandIcon: `${PREFIX}-expand-icon`,
  image: `${PREFIX}-image`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${boxClasses.image}`]: {
    width: "auto",
    height: "100%",
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
  const [modal, showModal] = useModal({ disablePortal: false });

  const handleZoomClick = React.useCallback(() => {
    showModal(media.label ?? media.description ?? "No label", (onClose) => (
      <StyledModalContent className={modalClasses.root}>
        <Box
          display={"flex"}
          flexDirection="column"
          style={{ position: "relative", height: "100%" }}
        >
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
      </StyledModalContent>
    ));
  }, [modal, media]);
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
            handleZoomClick();
          }}
          size="large"
        >
          <OpenInFull />
        </IconButton>
      ) : null}

      {!disableZoom ? modal : null}
    </StyledBox>
  );
};

export default ExpandableImageElement;
