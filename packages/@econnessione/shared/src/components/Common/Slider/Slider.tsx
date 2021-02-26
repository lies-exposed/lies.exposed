import * as React from "react";
import * as SlickSlider from "react-slick";

interface Slide {
  imageURL: string;
  authorName: string;
  info: string;
}

interface SliderProps extends SlickSlider.Settings {
  height: number;
  slides: Slide[];
  size: "contain" | "cover";
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  height,
  size,
  ...props
}) => {
  const heightAsPX = `${height}px`;
  return (
    <SlickSlider.default {...props}>
      {slides.map((s) => (
        <div
          key={s.imageURL}
          style={{
            position: "relative",
            height: heightAsPX,
            backgroundImage: `url(${s.imageURL})`,
            backgroundPosition: "center",
            backgroundSize: size,
            backgroundRepeat: "no-repeat",
          }}
        />
      ))}
    </SlickSlider.default>
  );
};
