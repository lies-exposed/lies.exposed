import * as React from "react";
import * as SlickSlider from "react-slick";

interface Slide {
  imageURL: string;
  authorName: string;
  info: string;
}

interface SliderProps extends SlickSlider.Settings {
  slides: Slide[];
}

export const Slider: React.FC<SliderProps> = ({ slides, ...props }) => {
  return (
    <SlickSlider.default {...{ ...props }}>
      {slides.map((s) => (
        <div key={s.imageURL}>
          <img
            src={s.imageURL}
            style={{ width: "100%", boxSizing: "content-box", height: "auto" }}
          />
        </div>
      ))}
    </SlickSlider.default>
  );
};
