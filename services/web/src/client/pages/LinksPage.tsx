import { type SearchFilters } from "@liexp/ui/lib/components/Common/Filters/SearchFiltersBox";
import { LinksPageTemplate } from "@liexp/ui/lib/templates/links/LinksPageTemplate";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const LinksPage: React.FC<RouteComponentProps> = (props) => {
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
