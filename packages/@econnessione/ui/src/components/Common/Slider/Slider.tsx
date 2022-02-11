import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Media } from "@econnessione/shared/io/http";
import * as React from "react";
import * as SlickSlider from "react-slick";
import { makeStyles, useTheme } from "../../../theme/index";
import MediaElement from "../../Media/MediaElement";

const useStyles = makeStyles((theme) => ({
  mediaSlider: {
    margin: 0,
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
      dots={true}
      responsive={[
        {
          breakpoint: theme.breakpoints.values.md,
          settings: {
            variableWidth: false,
            ...props,
          },
        },
      ]}
      {...{ ...props }}
    >
      {slides.map((s) => (
        <div
          key={s.location}
          style={{
            textAlign: "center",
            maxHeight,
            maxWidth: 600,
            margin: "auto",
          }}
        >
          <MediaElement
            media={s}
            style={{
              height: "100%",
              ...itemStyle,
            }}
          />
        </div>
      ))}
    </SlickSlider.default>
  );
};
