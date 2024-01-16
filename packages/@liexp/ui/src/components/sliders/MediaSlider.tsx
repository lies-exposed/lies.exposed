import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import { Slider, type SliderProps } from "../Common/Slider/Slider.js";
import MediaElement from "../Media/MediaElement.js";

const MEDIA_SLIDER_PREFIX = "media-slider";
const classes = {
  root: `${MEDIA_SLIDER_PREFIX}-root`,
  item: `${MEDIA_SLIDER_PREFIX}-item`,
};

const StyledSlider = styled(Slider)(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: "100%",
    backround: "red",
    [`& .${classes.item}`]: {
      margin: "auto",
      width: "100%",
      maxWidth: 600,
      maxHeight: 400,
      display: "block",
      objectFit: "contain",
      [theme.breakpoints.down("md")]: {
        maxHeight: 300,
      },
    },
  },
}));
export interface MediaSliderProps extends Omit<SliderProps, "slides"> {
  data: Media.Media[];
  disableZoom?: boolean;
  enableDescription?: boolean;
  onClick?: (e: Media.Media) => void;
  onLoad?: () => void;
  itemStyle?: (m: Media.Media) => React.CSSProperties;
  itemClassName?: string;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  data,
  itemStyle,
  onClick,
  onLoad,
  disableZoom,
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
              itemClassName={clsx(classes.item, itemClassName)}
              onLoad={i === 0 ? onLoad : undefined}
              enableDescription={enableDescription}
              disableZoom={disableZoom}
              itemStyle={itemStyle?.(m)}
            />
          </div>
        ))}
    </StyledSlider>
  );
};
