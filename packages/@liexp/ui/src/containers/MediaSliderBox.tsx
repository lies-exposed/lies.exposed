import { Media } from "@liexp/shared/io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { GetListParams } from "react-admin";
import { ErrorBox } from "../components/Common/ErrorBox";
import { LazyLoader } from "../components/Common/Loader";
import { MediaSlider } from "../components/sliders/MediaSlider";
import { Queries } from "../providers/DataProvider";

export interface MediaSliderProps {
  query: GetListParams;
  onClick: (e: Media.Media) => void;
  itemStyle?: React.CSSProperties;
}

export const MediaSliderBox: React.FC<MediaSliderProps> = ({
  query,
  ...props
}) => {
  return (
    <WithQueries
      queries={{ media: Queries.Media.getList }}
      params={{
        media: query,
      }}
      render={QR.fold(LazyLoader, ErrorBox, ({ media: { data, total } }) => {
        return <MediaSlider {...props} data={data} />;
      })}
    />
  );
};
