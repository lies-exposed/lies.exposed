import * as React from "react";
import AreasMap, { type AreasMapProps } from "../components/AreasMap";
import QueriesRenderer from "../components/QueriesRenderer";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider";

const AreasMapBox: React.FC<AreasMapProps> = (props) => {
  const Queries = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{
        areas: Queries.Area.list.useQuery(
          {
            pagination: { perPage: 20, page: 1 },
            filter: null,
            sort: {
              field: "id",
              order: "DESC",
            },
          },
          undefined,
          false,
        ),
      }}
      render={({ areas }) => {
        return <AreasMap {...props} areas={areas.data} />;
      }}
    />
  );
};

export default AreasMapBox;
