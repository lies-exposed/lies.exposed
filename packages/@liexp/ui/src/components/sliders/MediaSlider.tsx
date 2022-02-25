import { Media } from "@liexp/shared/io/http";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { Queries } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyLoader } from "../Common/Loader";
import { Slider } from "../Common/Slider/Slider";

export interface MediaSliderProps {
  ids: UUID[];
  onClick: (e: Media.Media) => void;
  itemStyle?: React.CSSProperties;
}

export const MediaSlider: React.FC<MediaSliderProps> = ({
  ids,
  itemStyle,
  onClick,
}) => {
  return (
    <WithQueries
      queries={{ media: Queries.Media.getList }}
      params={{
        media: {
          pagination: { perPage: ids.length, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { ids },
        },
      }}
      render={QR.fold(LazyLoader, ErrorBox, ({ media: { data, total } }) => {
        return (
          <Slider
            adaptiveHeight={true}
            infinite={false}
            arrows={true}
            draggable={true}
            dots={true}
            slides={data}
            style={{ maxWidth: 800, maxHeight: 500, margin: 'auto' }}
            itemStyle={{ maxWidth: 800, maxHeight: 500, margin: 'auto', ...itemStyle }}
          />
        );
      })}
    />
  );
};
