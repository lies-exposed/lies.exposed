import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import { MediaBox } from "@liexp/ui/components/containers/MediaBox";
import { Box, Container, TextField } from "@liexp/ui/components/mui";
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
      <MainContent
        style={{ display: "flex", flexShrink: 0, flexDirection: "column" }}
      >
        <Box
          style={{
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
      </MainContent>
      <Container>
        <MediaBox
          filter={queryParams.filter}
          onClick={(a) => {
            navigateTo.media({ id: a.id });
          }}
        />
      </Container>
    </Box>
  );
};

export default MediaPage;
