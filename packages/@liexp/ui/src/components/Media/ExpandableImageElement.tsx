import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { clsx } from "clsx";
import * as React from "react";
import { useModal } from "../../hooks/useModal.js";
import { styled } from "../../theme/index.js";
import { Box, IconButton, Typography, Icons } from "../mui/index.js";

const MODAL_PREFIX = "ExpandableImageElement-modal";
const modalClasses = {
  root: `${MODAL_PREFIX}-root`,
  image: `${MODAL_PREFIX}-image`,
  expandedDescription: `${MODAL_PREFIX}-expanded-description`,
};

const StyledModalContent = styled(Box)(() => ({
  [`&.${modalClasses.root}`]: {
    height: "100%",
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

const StyledBox = styled(Box)(({ theme: _theme }) => ({
  [`&.${boxClasses.root}`]: {
    overflow: "hidden",
  },
  [`& .${boxClasses.image}`]: {
    width: "100%",
    height: "100%",
    maxWidth: 2000,
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
  onLoad?: (rect: DOMRect) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  disableZoom?: boolean;
  fallbackImage?: string;
}

const ExpandableImageElement: React.FC<ExpandableImageElementProps> = ({
  media,
  className,
  style,
  onLoad,
  onClick,
  disableZoom = false,
  fallbackImage,
}) => {
  const [modal, showModal] = useModal({ disablePortal: false });

  const handleZoomClick = React.useCallback(() => {
    showModal(media.label ?? media.description ?? "No label", (_onClose) => (
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
      className={clsx(boxClasses.root, className)}
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
    >
      <img
        className={boxClasses.image}
        src={media.thumbnail}
        style={style}
        onLoad={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onLoad?.(rect);
        }}
        onError={(e) => {
          if (fallbackImage) {
            e.currentTarget.src = fallbackImage;
          }
        }}
        loading="lazy"
      />
      {!disableZoom ? (
        <IconButton
          className={boxClasses.expandIcon}
          aria-label="expand"
          onClick={(_e) => {
            handleZoomClick();
          }}
          size="large"
        >
          <Icons.OpenInFull />
        </IconButton>
      ) : null}

      {!disableZoom ? modal : null}
    </StyledBox>
  );
};

export default ExpandableImageElement;
