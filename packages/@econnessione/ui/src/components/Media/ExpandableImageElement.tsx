import { Media } from "@econnessione/shared/io/http";
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
}));

interface ExpandableImageElementProps {
  media: Omit<Media.Media, "type"> & { type: Media.ImageType };
  style?: React.CSSProperties;
}

const ExpandableImageElement: React.FC<ExpandableImageElementProps> = ({
  media,
  ...props
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <img
        src={media.location}
        style={props.style}
        onClick={() => {
          setOpen(true);
        }}
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
              <Box display="inline">
                <CloseOutlined onClick={() => setOpen(false)} />
                <Typography
                  id="alert-dialog-title"
                  variant="h4"
                  display="inline"
                >
                  {media.description}
                </Typography>
              </Box>

              <Box
                id="alert-dialog-description"
                display={"flex"}
                width="100%"
                height="100%"
              >
                <img src={media.location} width="100%" />
              </Box>
            </Box>
          </div>
        </div>
      </Modal>
    </Box>
  );
};

export default ExpandableImageElement;
