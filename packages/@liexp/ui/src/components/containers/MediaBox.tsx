import { type Media } from "@liexp/shared/io/http";
import * as React from "react";
import { useMediaQuery } from "../../state/queries/DiscreteQueries";
import QueriesRenderer from "../QueriesRenderer";
import { MediaList } from "../lists/MediaList";

export interface MediaBoxProps {
  filter: any;
  onClick: (e: Media.Media) => void;
}

export const MediaBox: React.FC<MediaBoxProps> = ({ filter, onClick }) => {
  return (
    <QueriesRenderer
      queries={{
        media: useMediaQuery(
          {
            pagination: {
              perPage: 20,
              page: 1,
            },
            filter,
          },
          false
        ),
      }}
      render={({ media: { data: media } }) => {
        return (
          <MediaList
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
            media={media.map((m) => ({ ...m, selected: true }))}
            onItemClick={(a) => {
              onClick(a);
            }}
          />
        );
      }}
    />
  );
};
