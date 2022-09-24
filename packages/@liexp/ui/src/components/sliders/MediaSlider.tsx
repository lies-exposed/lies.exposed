import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { styled } from "../../theme";
import { Slider, SliderProps } from "../Common/Slider/Slider";
import MediaElement from "../Media/MediaElement";

const MEDIA_SLIDER_PREFIX = "media-slider";
const classes = {
  root: `${MEDIA_SLIDER_PREFIX}-root`,
  item: `${MEDIA_SLIDER_PREFIX}-item`,
};

const StyledSlider = styled(Slider)(({ theme }) => ({
  [`& .${classes.item}`]: {
    margin: "auto",
    height: "100%",
    width: "100%",
    display: "block",
    objectFit: "contain",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
}));
export interface MediaSliderProps extends Omit<SliderProps, "slides"> {
  data: Media.Media[];
  enableDescription?: boolean;
  onClick?: (e: Media.Media) => void;
  onLoad?: () => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  data,
  itemStyle,
  onClick,
  style,
  onLoad,
  enableDescription,
  ...props
}) => {
  return (
    <StyledSlider
      adaptiveHeight={true}
      infinite={false}
      arrows={true}
      draggable={true}
      dots={true}
      centerMode={true}
      maxHeight={400}
      {...props}
    >
      {data
        .filter((s) => s !== undefined)
        .map((s, i) => (
          <div
            key={s.id}
            style={{
              margin: "auto",
              maxHeight: 400,
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MediaElement
              key={s.id}
              media={s}
              className={classes.item}
              style={{
                maxWidth: 600,
                minHeight: 200,
                height: 400,
                ...itemStyle,
              }}
              onLoad={i === 0 ? onLoad : undefined}
              enableDescription={enableDescription}
            />
          </div>
        ))}
    </StyledSlider>
  );
};
