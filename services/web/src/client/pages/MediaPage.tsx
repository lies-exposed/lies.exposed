import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { MediaList } from "@liexp/ui/components/lists/MediaList";
import { Box, TextField } from "@liexp/ui/components/mui";
import { useMediaQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const MediaPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  const [q, setQ] = React.useState("");

  const queryParams = {
    pagination: { page: 1, perPage: 40 },
    sort: { field: "id", order: "ASC" },
    filter: {
      description: q === "" ? undefined : q,
    },
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <MainContent>
        <Box
          style={{
            display: "flex",
            flexShrink: 0,
            width: "100%",
            marginBottom: 20,
          }}
        >
          <PageContent path="media" />
          <TextField
            value={q}
            placeholder="Search..."
            fullWidth
            onChange={(c) => {
              setQ(c.target.value);
            }}
          />
        </Box>

        <Box style={{ display: "flex", width: "100%" }}>
          <QueriesRenderer
            queries={{
              media: useMediaQuery(queryParams, false),
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
                    navigateTo.media({ id: a.id });
                  }}
                />
              );
            }}
          />
        </Box>
      </MainContent>
    </Box>
  );
};

export default MediaPage;
