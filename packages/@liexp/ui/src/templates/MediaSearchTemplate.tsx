import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { type GetListFnParamsE } from "@liexp/shared/lib/providers/EndpointsRESTClient/EndpointsRESTClient.js";
import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBox } from "../components/Common/ErrorBox.js";
import SearchFiltersBar, {
  type SearchFilters,
} from "../components/Common/Filters/SearchFiltersBox.js";
import { Box, Container, Stack } from "../components/mui/index.js";
import { PageContentBox } from "../containers/PageContentBox.js";
import { InfiniteMediaListBox } from "../containers/list/InfiniteMediaListBox.js";
import { SplitPageTemplate } from "./SplitPageTemplate.js";

export interface MediaSearchTemplateProps {
  filter: GetListFnParamsE<typeof Endpoints.Link.List>;
  onFilterChange: (f: SearchFilters) => void;
  onMediaClick: (m: Media.Media) => void;
  perPage?: number;
}

const MediaSearchTemplate: React.FC<MediaSearchTemplateProps> = ({
  filter,
  onFilterChange,
  onMediaClick,
  perPage = 50,
}) => {

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
            <SearchFiltersBar
              query={{
                ...filter.filter,
              }}
              layout={{ dateRangeBox: { variant: "picker", columns: 12 } }}
              onQueryChange={onFilterChange}
              onQueryClear={() => {}}
              // inputParams={{
              //   InputProps: {
              //     placeholder: "Search media",
              //   },
              // }}
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
      resource={{ name: "media", item: { id: '' } }}
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
          <ErrorBoundary FallbackComponent={ErrorBox}>
            <InfiniteMediaListBox
              filter={filter}
              listProps={{ type: "masonry" }}
              onMediaClick={onMediaClick}
            />
          </ErrorBoundary>
        </Container>
      </Box>
      <div />
    </SplitPageTemplate>
  );
};

export default MediaSearchTemplate;
