import { type SearchFilters } from "@liexp/ui/lib/components/Common/Filters/SearchFiltersBox";
import { LinksPageTemplate } from "@liexp/ui/lib/templates/links/LinksPageTemplate";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
import { useNavigateToResource } from "../utils/location.utils";

const LinksPage: React.FC<RouteComponentProps> = (props) => {
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

  const filter = {
    filter: {
      ...searchFilters,
    },
  };

  const handleQueryChange = (q: SearchFilters): void => {
    setQ({
      ...q,
      keywords: (searchFilters.keywords ?? []).concat(q.keywords ?? []),
    });
  };

  return (
    <LinksPageTemplate
      filter={filter}
      onFilterChange={handleQueryChange}
      onItemClick={(a) => {
        navigateTo.links({ id: a.id });
      }}
    />
  );
};

export default LinksPage;
