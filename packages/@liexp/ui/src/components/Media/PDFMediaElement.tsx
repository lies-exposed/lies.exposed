import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import { Box, Button, Modal, Typography, Icons, Stack } from "../mui/index.js";

const PREFIX = "PDFMediaElement";

const classes = {
  root: `${PREFIX}-root`,
  modalContainer: `${PREFIX}-modalContainer`,
  paper: `${PREFIX}-paper`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex !important",
    height: "100%",
    minHeight: 200,
  },
  [`& .${classes.modalContainer}`]: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },

  [`& .${classes.paper}`]: {
    position: "relative",
    width: "80%",
    minHeight: 400,
    maxHeight: "90%",
    height: "100%",
    margin: "auto",
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
  },
}));

interface PDFMediaElementProps {
  className?: string;
  media: Omit<Media.Media, "type"> & { type: Media.PDFType };
  style?: React.CSSProperties;
  onLoad?: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  disableOpen?: boolean;
}

const PDFMediaElement: React.FC<PDFMediaElementProps> = ({
  media,
  className,
  onLoad,
  style,
  onClick,
  disableOpen = true,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <StyledBox
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      className={clsx(classes.root, className)}
      onLoad={onLoad}
      onClick={onClick}
      style={{
        ...style,
        background: media.thumbnail ? `url(${media.thumbnail})` : undefined,
        backgroundRepeat: "no-repeat",
        backgroundSize: "auto 100%",
        backgroundPosition: "center",
      }}
    >
      {!onClick && !disableOpen ? (
        <Stack>
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
            onClose={() => {
              setOpen(false);
            }}
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
                    <Icons.Close
                      onClick={() => {
                        setOpen(false);
                      }}
                    />
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
        </Stack>
      ) : null}
    </StyledBox>
  );
};

export default PDFMediaElement;
