import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import AreasMap, { type AreasMapProps } from "../components/area/AreasMap.js";

const AreasMapBox: React.FC<AreasMapProps> = (props) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        areas: Q.Area.list.useQuery(
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
      })}
      render={({ areas }) => {
        return <AreasMap {...props} areas={areas.data} />;
      }}
    />
  );
};

export default AreasMapBox;
