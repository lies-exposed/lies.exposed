import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { Box } from "../components/mui";
import {
  MediaSlider,
  type MediaSliderProps
} from "../components/sliders/MediaSlider";
import { useMediaQuery } from "../state/queries/media.queries";

export interface MediaSliderBoxProps extends Omit<MediaSliderProps, 'data'> {
  query: GetListParams;
}

const MediaSliderBox: React.FC<MediaSliderBoxProps> = ({
  query,
  onClick,
  itemStyle,
  enableDescription,
  ...props
}) => {
  return (
    <QueriesRenderer
      queries={{ media: useMediaQuery(query, true) }}
      render={({ media: { data: media } }) => {
        return (
          <Box {...props}>
            <MediaSlider
              {...{ enableDescription, onClick, itemStyle }}
              data={media}
            />
          </Box>
        );
      }}
    />
  );
};

export default MediaSliderBox;
