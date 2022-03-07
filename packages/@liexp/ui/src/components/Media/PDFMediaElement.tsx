import { Media } from "@liexp/shared/io/http";
import { Box, Button, makeStyles, Modal, Typography } from "@material-ui/core";
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

interface PDFMediaElementProps {
  className?: string;
  media: Omit<Media.Media, "type"> & { type: Media.PDFType };
  style?: React.CSSProperties;
}

const PDFMediaElement: React.FC<PDFMediaElementProps> = ({ media, className, ...props }) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {media.thumbnail ?? <img className={className} src={media.thumbnail} />}
      <Button
        variant="contained"
        onClick={() => {
          setOpen(true);
        }}
        color="primary"
      >
        Open PDF
      </Button>

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
                <embed
                  src={media.location}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                />
              </Box>
            </Box>
          </div>
        </div>
      </Modal>
    </Box>
  );
};

export default PDFMediaElement;
