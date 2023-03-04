import { type Media } from "@liexp/shared/io/http";
import * as React from "react";
import { MainContent } from "../components/MainContent";
import { PageContent } from "../components/PageContent";
import SearchEventInput, {
  type SearchFilter,
} from "../components/events/inputs/SearchEventInput";
import { Box, Container } from "../components/mui";
import { MediaBox } from "../containers/MediaBox";

export interface MediaSearchTemplateProps {
  filter: SearchFilter;
  onFilterChange: (f: SearchFilter) => void;
  onMediaClick: (m: Media.Media) => void;
  perPage?: number;
}

const MediaSearchTemplate: React.FC<MediaSearchTemplateProps> = ({
  filter: _filter,
  onFilterChange,
  onMediaClick,
  perPage = 50,
}) => {
  const filter = {
    ..._filter,
    description: _filter.title,
    keywords: (_filter.keywords ?? []).map((k) => k.id),
    groups: (_filter.groups ?? []).map((g) => g.id),
    actors: (_filter.actors ?? []).map((a) => a.id),
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        height: "100%",
        flexWrap: 'wrap'
      }}
    >
      <Box style={{ display: "flex", width: '100%', flexShrink: 0 }}>
        <MainContent
          style={{ display: "flex", width: '100%', flexShrink: 0, flexDirection: "column" }}
        >
          <Box
            style={{
              width: "100%",
              marginBottom: 20,
            }}
          >
            <PageContent path="media" />
            <SearchEventInput
              query={{
                hash: "",
                ...filter,
              }}
              onQueryChange={onFilterChange}
            />
          </Box>
        </MainContent>
      </Box>

      <Container style={{ display: "flex" }}>
        <MediaBox filter={filter} onClick={onMediaClick} perPage={perPage} />
      </Container>
    </Box>
  );
};

export default MediaSearchTemplate;
