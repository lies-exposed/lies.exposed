import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { Slider, SliderProps } from "../Common/Slider/Slider";

export interface MediaSliderProps extends Omit<SliderProps, "slides"> {
  data: Media.Media[];
  enableDescription?: boolean;
  onClick?: (e: Media.Media) => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  data,
  itemStyle,
  onClick,
  ...props
}) => {
  return (
    <Slider
      adaptiveHeight={true}
      infinite={false}
      arrows={true}
      draggable={true}
      dots={true}
      centerMode={true}
      slides={data}
      style={{ height: 300, margin: "auto" }}
      {...props}
      itemStyle={{
        maxWidth: 800,
        maxHeight: 300,
        ...itemStyle,
      }}
    />
  );
};
