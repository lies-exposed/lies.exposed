import { Media } from "@liexp/shared/io/http";
import { Box } from "@mui/material";
import * as React from "react";
import { GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { MediaSlider } from "../components/sliders/MediaSlider";
import { useMediaQuery } from "../state/queries/DiscreteQueries";

export interface MediaSliderProps {
  query: GetListParams;
  onClick: (e: Media.Media) => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

const MediaSliderBox: React.FC<MediaSliderProps> = ({
  query,
  onClick,
  itemStyle,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={{ media: useMediaQuery(query) }}
      render={({ media: { data: media } }) => {
        return (
          <Box {...props}>
            <MediaSlider {...{ onClick, itemStyle }} data={media} />
          </Box>
        );
      }}
    />
  );
};

export default MediaSliderBox;
