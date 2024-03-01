import * as React from "react";
import { Box } from "../mui/index.js";
import { MediaSlider, type MediaSliderProps } from "../sliders/MediaSlider.js";

type MediaModalContentProps = MediaSliderProps;

export const MediaModalContent: React.FC<MediaModalContentProps> = ({
  ...props
}) => {
  return (
    <Box
      style={{
        padding: 20,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <MediaSlider
        enableDescription={true}
        {...props}
        style={{ width: "100%" }}
        itemStyle={() => ({ height: 400 })}
        disableZoom={false}
      />
    </Box>
  );
};
