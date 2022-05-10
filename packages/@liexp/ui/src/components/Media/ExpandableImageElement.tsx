import { Media } from "@liexp/shared/io/http";
import { CloseOutlined, ExpandMore } from "@mui/icons-material";
import {
  Box,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import * as React from "react";

const PREFIX = 'ExpandableImageElement';

const classes = {
  modalContainer: `${PREFIX}-modalContainer`,
  paper: `${PREFIX}-paper`,
  image: `${PREFIX}-image`
};

const StyledBox = styled(Box)((
  {
    theme
  }
) => ({
  [`& .${classes.modalContainer}`]: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  [`& .${classes.paper}`]: {
    width: "80%",
    minHeight: 400,
    maxHeight: "90%",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },

  [`& .${classes.image}`]: {
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: 800,
    objectFit: "contain",
  }
}));

interface ExpandableImageElementProps {
  className?: string;
  media: Omit<Media.Media, "type"> & { type: Media.ImageType };
  style?: React.CSSProperties;
  onLoad?: () => void;
}

const ExpandableImageElement: React.FC<ExpandableImageElementProps> = ({
  media,
  className,
  style,
  onLoad,
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
      <IconButton
        aria-label="expand"
        onClick={(e) => {
          setOpen(true);
        }}
        style={{
          position: 'absolute'
        }}
        size="large">
        <ExpandMore />
      </IconButton>
      <img
        className={classes.image}
        src={media.location}
        style={style}
        onLoad={onLoad}
        loading="lazy"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className={classes.modalContainer}>
          <div className={classes.paper}>
            <Box
              display={"flex"}
              flexDirection="column"
              style={{ position: "relative", height: "100%" }}
            >
              <Box
                display="flex"
                style={{ position: 'absolute', flexDirection: "column", alignItems: "flex-end" }}
              >
                <CloseOutlined onClick={() => setOpen(false)} />
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
                <img className={classes.image} src={media.location} style={{
                  maxHeight: '100%'
                }} />
                <Typography id="alert-dialog-title" variant="body2">
                  {media.description}
                </Typography>
              </Box>
            </Box>
          </div>
        </div>
      </Modal>
    </StyledBox>
  );
};

export default ExpandableImageElement;
