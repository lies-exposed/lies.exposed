import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { Slider } from "../Common/Slider/Slider";

export interface MediaSliderProps {
  data: Media.Media[];
  onClick: (e: Media.Media) => void;
  itemStyle?: React.CSSProperties;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  data,
  itemStyle,
  onClick,
}) => {


  return (
    <Slider
      adaptiveHeight={true}
      infinite={false}
      arrows={true}
      draggable={true}
      dots={true}
      slides={data}
      style={{ maxWidth: 800, maxHeight: 500, margin: "auto" }}
      itemStyle={{
        maxWidth: 800,
        maxHeight: 500,
        ...itemStyle,
      }}
    />
  );
};
