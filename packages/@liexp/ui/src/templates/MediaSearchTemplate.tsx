import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { KeywordsBox } from "../components/KeywordsBox.js";
import SearchEventInput, {
  type SearchFilter,
} from "../components/events/inputs/SearchEventInput.js";
import { Box, Container, Stack } from "../components/mui/index.js";
import ActorsBox from "../containers/ActorsBox.js";
import { GroupsBox } from "../containers/GroupsBox.js";
import { PageContentBox } from "../containers/PageContentBox.js";
import { InfiniteMediaListBox } from "../containers/list/InfiniteMediaListBox.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

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
    <SplitPageTemplate
      aside={
        <Stack style={{ width: "100%" }} spacing={1}>
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
              inputParams={{
                InputProps: {
                  placeholder: "Search media",
                },
              }}
              style={{ width: "100%" }}
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
        </Stack>
      }
      tab={0}
      tabs={[
        {
          label: "Search",
        },
      ]}
      resource={{ name: "media", item: null }}
      onTabChange={() => {}}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          height: "100%",
          flexWrap: "wrap",
        }}
      >
        <Container style={{ display: "flex" }}>
          <InfiniteMediaListBox
            listProps={{ type: "masonry" }}
            onMediaClick={onMediaClick}
          />
        </Container>
      </Box>
      <div />
    </SplitPageTemplate>
  );
};

export default MediaSearchTemplate;
