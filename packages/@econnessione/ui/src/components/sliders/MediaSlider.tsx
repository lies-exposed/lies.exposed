import { Media } from "@econnessione/shared/io/http";
import { Typography } from "@material-ui/core";
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
}

export const MediaSlider: React.FC<MediaSliderProps> = ({ ids, onClick }) => {
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
          <div>
            <Slider
              adaptiveHeight={true}
              infinite={false}
              arrows={true}
              draggable={false}
              dots={true}
              slides={data}
            />
          </div>
        );
      })}
    />
  );
};
