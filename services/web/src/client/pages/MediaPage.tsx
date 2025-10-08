import { type SearchFilters } from "@liexp/ui/lib/components/Common/Filters/SearchFiltersBox.js";
import MediaSearchTemplate from "@liexp/ui/lib/templates/MediaSearchTemplate.js";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
import { useNavigateToResource } from "../utils/location.utils.js";

const MediaPage: React.FC<RouteComponentProps> = (_props) => {
  const navigateTo = useNavigateToResource();
  const [searchFilters, setQ] = React.useState<SearchFilters>({
    keywords: [],
    q: "",
    actors: [],
    groups: [],
    startDate: undefined,
    endDate: undefined,
    _order: "DESC",
    _sort: "createdAt",
  });

  const queryParams = {
    q: searchFilters.q === "" ? undefined : searchFilters.q,
    keywords: searchFilters.keywords ?? [],
    _sort: "createdAt",
    _order: "DESC" as const,
    groups: [],
    actors: [],
  };

  const handleQueryChange = (q: SearchFilters): void => {
    setQ({
      ...q,
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
