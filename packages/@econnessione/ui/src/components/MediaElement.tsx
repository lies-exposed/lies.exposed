import { Media } from "@econnessione/shared/io/http";
import { Box, makeStyles } from "@material-ui/core";
import * as React from "react";

const useStyles = makeStyles(() => ({
  root: {
    border: "1px solid black",
    margin: 5
  },
}));
interface MediaElementProps {
  media: Media.Media;
  style?: React.CSSProperties;
}

const MediaElement: React.FC<MediaElementProps> = (props) => {
  const classes = useStyles();
  const mediaElement = React.useMemo(() => {
    switch (props.media.type) {
      case Media.MediaType.types[5].value:
        return <iframe src={props.media.location} {...props} />;
      case Media.MediaType.types[4].value: {
        return <div style={props.style}>PDF preview</div>;
      }
      case Media.MediaType.types[3].value: {
        return (
          <video
            src={props.media.location}
            style={props.style}
            controls={true}
            autoPlay={false}
          />
        );
      }
      default:
        return <img src={props.media.location} style={props.style} />;
    }
  }, [props.media]);

  return <Box className={classes.root}>{mediaElement}</Box>;
};

export default MediaElement;
