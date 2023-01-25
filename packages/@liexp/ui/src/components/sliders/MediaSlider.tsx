import { type Media } from "@liexp/shared/io/http";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme";
import { Slider, type SliderProps } from "../Common/Slider/Slider";
import MediaElement from "../Media/MediaElement";

const MEDIA_SLIDER_PREFIX = "media-slider";
const classes = {
  root: `${MEDIA_SLIDER_PREFIX}-root`,
  item: `${MEDIA_SLIDER_PREFIX}-item`,
};

const StyledSlider = styled(Slider)(({ theme }) => ({
  [`&.${classes.root}`]: {
    height: "100%",
    width: "100%",
    [`& .${classes.item}`]: {
      margin: "auto",
      width: "100%",
      maxWidth: 600,
      height: 400,
      display: "block",
      objectFit: "contain",
      [theme.breakpoints.down("md")]: {
        height: 300,
      },
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
  itemClassName?: string;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  data,
  itemStyle,
  onClick,
  style,
  onLoad,
  enableDescription,
  className,
  itemClassName,
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
      className={clsx(classes.root, className)}
    >
      {data
        .filter((m) => m !== undefined)
        .map((m, i) => (
          <div
            key={m.id}
            style={{
              margin: "auto",
              height: "100%",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MediaElement
              key={m.id}
              media={m}
              className={clsx(classes.item, itemClassName)}
              onLoad={i === 0 ? onLoad : undefined}
              enableDescription={enableDescription}
            />
          </div>
        ))}
    </StyledSlider>
  );
};
