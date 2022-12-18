import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { MediaList } from "@liexp/ui/components/lists/MediaList";
import { Box } from "@liexp/ui/components/mui";
import { useMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

export const queryParams = {
  pagination: { page: 1, perPage: 40 },
  sort: { field: "id", order: "ASC" },
  filter: {},
};

const MediaPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  return (
    <QueriesRenderer
      queries={{
        media: useMediaQuery(queryParams, false),
      }}
      render={({ media: { data: media } }) => {
        return (
          <Box style={{ display: "flex", justifyContent: "center" }}>
            <PageContent path="media" />
            <>
              <MediaList
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
                media={media.map((m) => ({ ...m, selected: true }))}
                onItemClick={(a) => {
                  navigateTo.media({ id: a.id });
                }}
              />
            </>
          </Box>
        );
      }}
    />
  );
};

export default MediaPage;
