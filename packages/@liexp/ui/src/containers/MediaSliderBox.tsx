import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { Box } from "../components/mui/index.js";
import {
  MediaSlider,
  type MediaSliderProps,
} from "../components/sliders/MediaSlider.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";

export interface MediaSliderBoxProps extends Omit<MediaSliderProps, "data"> {
  query: GetListParams;
}

const MediaSliderBox: React.FC<MediaSliderBoxProps> = ({
  query,
  onClick,
  itemStyle,
  enableDescription,
  disableZoom,
  ...props
}) => {
  const Queries = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{ media: Queries.Media.list.useQuery(query, undefined, false) }}
      render={({ media: { data: media } }) => {
        return (
          <Box {...props}>
            <MediaSlider
              {...{ enableDescription, onClick, itemStyle, disableZoom }}
              data={media}
            />
          </Box>
        );
      }}
    />
  );
};

export default MediaSliderBox;
