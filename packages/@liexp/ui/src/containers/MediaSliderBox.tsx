import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { MediaSlider } from "../components/sliders/MediaSlider";
import { useMediaQuery } from "../state/queries/DiscreteQueries";

export interface MediaSliderProps {
  query: GetListParams;
  onClick: (e: Media.Media) => void;
  itemStyle?: React.CSSProperties;
}

const MediaSliderBox: React.FC<MediaSliderProps> = ({ query, ...props }) => {
  return (
    <QueriesRenderer
      queries={{ media: useMediaQuery(query) }}
      render={({ media: { data: media  } }) => {
        return <MediaSlider {...props} data={media} />;
      }}
    />
  );
};

export default MediaSliderBox;
