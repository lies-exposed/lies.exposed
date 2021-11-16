import { MediaType } from "@econnessione/shared/io/http/Media";
import * as React from "react";
import * as SlickSlider from "react-slick";

interface Slide {
  src: string;
  type: MediaType;
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
        <div
          key={s.src}
          style={{
            textAlign: "center",
            maxHeight,
            background: `url(${s.src})`,
            backgroundSize: "100% auto",
          }}
        >
          {s.type === MediaType.types[2].value ? (
            <video
              key={s.src}
              src={s.src}
              controls={true}
              style={{
                maxHeight,
                boxSizing: "content-box",
                display: "block",
                margin: "auto",
              }}
            />
          ) : (
            <img
              key={s.src}
              src={s.src}
              style={{
                boxSizing: "content-box",
                maxHeight,
                display: "block",
                margin: "auto",
              }}
            />
          )}
        </div>
      ))}
    </SlickSlider.default>
  );
};
