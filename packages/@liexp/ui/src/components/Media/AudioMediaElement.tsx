import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { ParentSize } from "@visx/responsive";
import { clsx } from "clsx";
import * as React from "react";
import _ReactAudioPlayer from "react-audio-player";
import { styled } from "../../theme/index.js";
import { Box } from "../mui/index.js";
import { WaveformThumbnail } from "./WaveformThumbnail.js";

const ReactAudioPlayer: any = _ReactAudioPlayer;

const PREFIX = "AudioMediaElement";

const classes = {
  root: `${PREFIX}-root`,
  player: `${PREFIX}-iframe`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  [`& .${classes.player}`]: {
    display: "flex",
    width: "100%",
  },
}));

interface AudioMediaElementProps {
  media: Omit<Media.Media, "type"> & { type: Media.AudioType };
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

const AudioMediaElement: React.FC<AudioMediaElementProps> = ({
  media,
  onLoad,
  style,
  ...props
}) => {
  const ref = React.createRef<_ReactAudioPlayer>();

  React.useEffect(() => {
    onLoad?.();
  }, []);

  return (
    <Root className={classes.root}>
      <Box style={{ display: "flex", width: "100%" }}>
        <ParentSize style={{ width: "100%", minHeight: 60, maxHeight: 200 }}>
          {({ height, width }) => (
            <WaveformThumbnail
              {...props}
              media={media}
              onClick={() => {
                const paused = ref.current?.audioEl.current?.paused;
                const played = ref.current?.audioEl.current?.played;

                if (!paused || played?.length) {
                  void ref.current?.audioEl.current?.pause();
                } else {
                  void ref.current?.audioEl.current?.play();
                }
              }}
              height={height}
              width={width}
            />
          )}
        </ParentSize>
      </Box>
      <ReactAudioPlayer
        className={clsx(classes.player, props.className)}
        {...props}
        src={media.location}
        ref={ref}
        controls
      />
    </Root>
  );
};

export default AudioMediaElement;
