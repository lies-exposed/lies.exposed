import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import * as SlickSlider from "react-slick";
import { makeStyles, useTheme } from "../../../theme/index";
import MediaElement from "../../Media/MediaElement";

const useStyles = makeStyles((theme) => ({
  mediaSlider: {
    margin: 0,
    maxWidth: 800,
    maxHeight: 400,
    width: "100%",
  },
  item: {
    margin: "auto",
    height: "100%",
    width: "100%",
    display: "block",
    objectFit: "contain",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  mediaSliderDownMD: {
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
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  maxHeight = 400,
  itemStyle,
  ...props
}) => {
  const theme = useTheme();
  const classes = useStyles();

  return (
    <SlickSlider.default
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
          },
        },
      ]}
      {...{ ...props }}
    >
      {slides.map((s) => (
        <div key={s.id}>
          <MediaElement
            key={s.id}
            media={s}
            className={classes.item}
            style={itemStyle}
          />
        </div>
      ))}
    </SlickSlider.default>
  );
};
