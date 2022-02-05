import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Media } from "@econnessione/shared/io/http";
import * as React from "react";
import * as SlickSlider from "react-slick";
import { makeStyles } from "../../../theme/index";
import MediaElement from "../../Media/MediaElement";

const useStyles = makeStyles((theme) => ({
  mediaSlider: {
    margin: 20,
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
  const classes = useStyles();

  return (
    <SlickSlider.default className={classes.mediaSlider} {...{ ...props }}>
      {slides.map((s) => (
        <div
          key={s.location}
          style={{
            textAlign: "center",
            maxHeight,
            maxWidth: 600,
          }}
        >
          <MediaElement
            media={s}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 300,
              ...itemStyle
            }}
          />
        </div>
      ))}
    </SlickSlider.default>
  );
};
