import * as React from "react";
import * as SlickSlider from "react-slick";

interface Slide {
  imageURL: string;
  authorName: string;
  info: string;
}

interface SliderProps extends SlickSlider.Settings {
  slides: Slide[];
  size: "contain" | "cover";
}

export const Slider: React.FC<SliderProps> = ({ slides, size, ...props }) => {
  return (
    <SlickSlider.default {...{ ...props, slidesToShow: 1 }}>
      {slides.map((s) => (
        <div key={s.imageURL}>
          <img src={s.imageURL} style={{ width: "100%" }} />
        </div>
      ))}
    </SlickSlider.default>
  );
};
