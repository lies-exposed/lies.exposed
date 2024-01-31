import { type SearchFilters } from "@liexp/ui/lib/components/Common/Filters/SearchFiltersBox";
import MediaSearchTemplate from "@liexp/ui/lib/templates/MediaSearchTemplate";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const MediaPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  const [searchFilters, setQ] = React.useState<SearchFilters>({
    keywords: [],
    search: "",
    actors: [],
    groups: [],
    startDate: undefined,
    endDate: undefined,
    _order: "DESC",
    _sort: "createdAt",
  });

  const queryParams = {
    filter: {
      search: searchFilters.search === "" ? undefined : searchFilters.search,
      keywords: searchFilters.keywords ?? [],
      _sort: "createdAt",
      _order: "DESC" as const,
      groups: [],
      actors: [],
    },
  };

  const handleQueryChange = (q: SearchFilters): void => {
    setQ({
      ...q,
      keywords: (searchFilters.keywords ?? []).concat(
        q.keywords ?? ([] as any[]),
      ),
    });
  };

  return (
    <MediaSearchTemplate
      filter={queryParams}
      onFilterChange={handleQueryChange}
      onMediaClick={(a) => {
        navigateTo.media({ id: a.id });
      }}
    />
  );
};

export default MediaPage;
