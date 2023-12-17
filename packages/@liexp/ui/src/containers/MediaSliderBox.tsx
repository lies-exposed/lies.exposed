import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { Box } from "../components/mui";
import {
  MediaSlider,
  type MediaSliderProps,
} from "../components/sliders/MediaSlider";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider";

export interface MediaSliderBoxProps extends Omit<MediaSliderProps, "data"> {
  query: GetListParams;
}

const MediaSliderBox: React.FC<MediaSliderBoxProps> = ({
  query,
  onClick,
  itemStyle,
  enableDescription,
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
