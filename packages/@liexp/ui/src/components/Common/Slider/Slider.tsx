import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import * as SlickSlider from "react-slick";
import { styled, useTheme } from "../../../theme";
import MediaElement from "../../Media/MediaElement";

const PREFIX = "Slider";

const classes = {
  mediaSlider: `${PREFIX}-mediaSlider`,
  item: `${PREFIX}-item`,
  mediaSliderDownMD: `${PREFIX}-mediaSliderDownMD`,
};

const StyledSlickSlider = styled(SlickSlider.default)(({ theme }) => ({
  [`& .${classes.mediaSlider}`]: {
    margin: 0,
    maxWidth: 800,
    maxHeight: 400,
    width: "100%",
  },

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

  [`& .${classes.mediaSliderDownMD}`]: {
    width: "100%",
    "& > .slick-list > .slick-track": {
      margin: 0,
    },
  },
}));

interface SliderProps extends SlickSlider.Settings {
  slides: Media.Media[];
  maxHeight?: number;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onLoad?: () => void;
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  maxHeight = 400,
  itemStyle,
  onLoad,
  ...props
}) => {
  const theme = useTheme();

  return (
    <StyledSlickSlider
      className={classes.mediaSlider}
      adaptiveHeight={true}
      infinite={false}
      arrows={true}
      draggable={true}
      centerMode={true}
      dots={true}
      slidesToShow={1}
      slidesPerRow={1}
      lazyLoad="progressive"
      responsive={[
        {
          breakpoint: theme.breakpoints.values.md,
          settings: {
            ...props,
            className: classes.mediaSliderDownMD,
            centerPadding: "0px",
          },
        },
      ]}
      {...props}
    >
      {slides.map((s, i) => (
        <div
          key={s.id}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MediaElement
            key={s.id}
            media={s}
            className={classes.item}
            style={itemStyle}
            onLoad={i === 0 ? onLoad : undefined}
          />
        </div>
      ))}
    </StyledSlickSlider>
  );
};
