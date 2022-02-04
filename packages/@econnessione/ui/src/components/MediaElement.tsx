import { Media } from "@econnessione/shared/io/http";
import { Box, makeStyles } from "@material-ui/core";
import * as React from "react";

const useStyles = makeStyles(() => ({
  root: {
    border: "1px solid black",
    margin: 5,
  },
}));
interface MediaElementProps {
  media: Media.Media;
  style?: React.CSSProperties;
}

const MediaElement: React.FC<MediaElementProps> = ({ media, ...props }) => {
  const classes = useStyles();
  const mediaElement = React.useMemo(() => {
    switch (media.type) {
      case Media.MediaType.types[5].value:
        return (
          <iframe
            src={media.location}
            {...props}
            style={{ minHeight: 300, ...props.style }}
          />
        );
      case Media.MediaType.types[4].value: {
        return <div style={props.style}>PDF preview</div>;
      }
      case Media.MediaType.types[3].value: {
        return (
          <video
            src={media.location}
            style={props.style}
            controls={true}
            autoPlay={false}
          />
        );
      }
      default:
        return <img src={media.location} style={props.style} />;
    }
  }, [media]);

  return <Box className={classes.root}>{mediaElement}</Box>;
};

export default MediaElement;
