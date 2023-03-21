import { type Media } from "@liexp/shared/io/http";
import { CloseOutlined } from "@mui/icons-material";
import * as React from "react";
import { styled } from "../../theme";
import { Box, Button, Modal, Typography } from "../mui";

const PREFIX = "PDFMediaElement";

const classes = {
  modalContainer: `${PREFIX}-modalContainer`,
  paper: `${PREFIX}-paper`,
};

const StyledBox = styled(Box)(({ theme }) => ({
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
    position: 'relative',
    width: "80%",
    minHeight: 400,
    maxHeight: "90%",
    height: "100%",
    margin: 'auto',
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
}

const PDFMediaElement: React.FC<PDFMediaElementProps> = ({
  media,
  className,
  onLoad,
  style,
  onClick,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <StyledBox
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      className={className}
      onLoad={onLoad}
      onClick={onClick}
      style={{
        ...style,
        background: media.thumbnail ? `url(${media.thumbnail})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {!onClick ? (
        <Button
          variant="contained"
          style={{
            position: "absolute",
          }}
          onClick={() => {
            setOpen(true);
          }}
          color="primary"
        >
          Open PDF
        </Button>
      ) : null}

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
                <CloseOutlined
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
    </StyledBox>
  );
};

export default PDFMediaElement;
