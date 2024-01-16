import { type SearchFilter } from "@liexp/ui/lib/components/events/inputs/SearchEventInput.js";
import MediaSearchTemplate from "@liexp/ui/lib/templates/MediaSearchTemplate";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const MediaPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  const [{ keywords, title }, setQ] = React.useState<SearchFilter>({
    keywords: [],
    title: "",
    actors: [],
    groups: [],
  });

  const queryParams = {
    filter: {
      title: title === "" ? undefined : title,
      keywords,
      _sort: "createdAt",
      _order: "DESC" as const,
      groups: [],
      actors: [],
    },
  };

  const handleQueryChange = (q: SearchFilter): void => {
    setQ({
      ...q,
      keywords: keywords.concat(q.keywords ?? []),
    });
  };

  return (
    <MediaSearchTemplate
      filter={queryParams.filter}
      onFilterChange={handleQueryChange}
      onMediaClick={(a) => {
        navigateTo.media({ id: a.id });
      }}
    />
  );
};

export default MediaPage;
