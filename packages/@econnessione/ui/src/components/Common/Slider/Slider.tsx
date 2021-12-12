import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { Media } from "@econnessione/shared/io/http";
import * as React from "react";
import * as SlickSlider from "react-slick";
import { makeStyles } from "../../../theme/index";
import MediaElement from "../../MediaElement";

const useStyles = makeStyles((theme) => ({
  mediaSlider: {
    margin: 20,
  },
}));

interface SliderProps extends SlickSlider.Settings {
  slides: Media.Media[];
  style?: React.CSSProperties;
  maxHeight?: number;
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  maxHeight = 400,
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
            // background: `url(${s.location})`,
            backgroundSize: "100% auto",
          }}
        >
          <MediaElement
            media={s}
            style={{
              width: "100%",
            }}
          />
        </div>
      ))}
    </SlickSlider.default>
  );
};
