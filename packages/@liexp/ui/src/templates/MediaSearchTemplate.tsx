import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { KeywordsBox } from "../components/KeywordsBox.js";
import { MainContent } from "../components/MainContent.js";
import SearchEventInput, {
  type SearchFilter,
} from "../components/events/inputs/SearchEventInput.js";
import { Box, Container } from "../components/mui/index.js";
import ActorsBox from "../containers/ActorsBox.js";
import { GroupsBox } from "../containers/GroupsBox.js";
import { MediaBox } from "../containers/MediaBox.js";
import { PageContentBox } from "../containers/PageContentBox.js";

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
        flexWrap: "wrap",
      }}
    >
      <Box style={{ display: "flex", width: "100%", flexShrink: 0 }}>
        <MainContent
          style={{
            display: "flex",
            width: "100%",
            flexShrink: 0,
            flexDirection: "column",
          }}
        >
          <Box
            style={{
              width: "100%",
              marginBottom: 20,
            }}
          >
            <PageContentBox path="media" />
            <SearchEventInput
              query={{
                hash: "",
                ...filter,
              }}
              onQueryChange={onFilterChange}
            />
            <KeywordsBox
              ids={filter.keywords}
              onItemClick={(k) => {
                onFilterChange({
                  ..._filter,
                  keywords: _filter.keywords.filter((kk) => kk.id !== k.id),
                });
              }}
            />
            <ActorsBox
              params={{ filter: { ids: filter.actors } }}
              onActorClick={(a) => {
                onFilterChange({
                  ..._filter,
                  actors: _filter.actors.filter((kk) => kk.id !== a.id),
                });
              }}
            />
            <GroupsBox
              params={{ filter: { ids: filter.groups } }}
              onItemClick={(g) => {
                onFilterChange({
                  ..._filter,
                  groups: _filter.groups.filter((kk) => kk.id !== g.id),
                });
              }}
            />
          </Box>
        </MainContent>
      </Box>

      <Container style={{ display: "flex" }}>
        <MediaBox
          filter={filter}
          onClick={onMediaClick}
          perPage={perPage}
          hideDescription
        />
      </Container>
    </Box>
  );
};

export default MediaSearchTemplate;
