import { Media } from "@liexp/shared/io/http";
import { Box, makeStyles, Modal, Typography } from "@material-ui/core";
import { CloseOutlined } from "@material-ui/icons";
import * as React from "react";

const useStyles = makeStyles((theme) => ({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    width: "80%",
    minHeight: 400,
    maxHeight: "90%",
    height: "100%",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
  image: {
    width: "auto",
    height: "auto",
    maxWidth: "100%",
    maxHeight: 800,
    objectFit: "contain",
  },
}));

interface ExpandableImageElementProps {
  className?: string;
  media: Omit<Media.Media, "type"> & { type: Media.ImageType };
  style?: React.CSSProperties;
  onLoad?: () => void
}

const ExpandableImageElement: React.FC<ExpandableImageElementProps> = ({
  media,
  className,
  style,
  onLoad
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  return (
    <Box
      className={className}
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <img
        className={classes.image}
        src={media.location}
        style={style}
        onClick={() => {
          setOpen(true);
        }}
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
                style={{ flexDirection: "column", alignItems: "flex-end" }}
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
                <img className={classes.image} src={media.location} />
                <Typography id="alert-dialog-title" variant="body2">
                  {media.description}
                </Typography>
              </Box>
            </Box>
          </div>
        </div>
      </Modal>
    </Box>
  );
};

export default ExpandableImageElement;
