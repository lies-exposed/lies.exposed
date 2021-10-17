import * as React from "react";
import * as SlickSlider from "react-slick";

interface Slide {
  imageURL: string;
  authorName: string;
  info: string;
}

interface SliderProps extends SlickSlider.Settings {
  slides: Slide[];
  style?: React.CSSProperties;
  maxHeight?: number;
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  maxHeight = 400,
  ...props
}) => {
  return (
    <SlickSlider.default {...{ ...props }}>
      {slides.map((s) => (
        <div key={s.imageURL} style={{ textAlign: "center", maxHeight }}>
          <img
            src={s.imageURL}
            style={{
              boxSizing: "content-box",
              maxHeight,
              display: "block",
              margin: "auto",
            }}
          />
        </div>
      ))}
    </SlickSlider.default>
  );
};
