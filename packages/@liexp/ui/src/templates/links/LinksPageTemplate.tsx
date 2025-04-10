import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Link } from "@liexp/shared/lib/io/http/index.js";
import { type GetListFnParamsE } from "@ts-endpoint/react-admin";
import { defaultUseQueryListParams } from "@ts-endpoint/tanstack-query";
import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorBox } from "../../components/Common/ErrorBox.js";
import SearchFiltersBar, {
  type SearchFilters,
} from "../../components/Common/Filters/SearchFiltersBox.js";
import { Box, Container, Stack } from "../../components/mui/index.js";
import { InfiniteLinksListBox } from "../../containers/list/InfiniteLinksListBox.js";
import { SplitPageTemplate } from "../SplitPageTemplate.js";

export interface LinksPageTemplateProps {
  filter: GetListFnParamsE<typeof Endpoints.Link.List>;
  onFilterChange: (f: SearchFilters) => void;
  onItemClick: (l: Link.Link) => void;
}

export const LinksPageTemplate: React.FC<LinksPageTemplateProps> = ({
  filter: _filter,
  onFilterChange,
  onItemClick,
}) => {
  const filter = {
    ...defaultUseQueryListParams,
    ..._filter,
    filter: {
      ...defaultUseQueryListParams.filter,
      ...(_filter.filter ?? {}),
    },
  };
  return (
    <SplitPageTemplate
      aside={
        <Stack spacing={2} style={{ width: "100%" }} padding={2}>
          <SearchFiltersBar
            query={filter.filter}
            layout={{ dateRangeBox: { variant: "picker", columns: 12 } }}
            onQueryChange={onFilterChange}
            onQueryClear={() => {}}
          />
        </Stack>
      }
      tab={0}
      tabs={[
        {
          label: "Search",
        },
      ]}
      onTabChange={(t) => {}}
      resource={{ name: "links", item: {} }}
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
            <InfiniteLinksListBox
              listProps={{ type: "masonry" }}
              filter={filter}
              onLinkClick={onItemClick}
            />
          </ErrorBoundary>
        </Container>
      </Box>
      <div />
    </SplitPageTemplate>
  );
};
