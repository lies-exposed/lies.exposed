import * as React from "react";
import AreasMap, { AreasMapProps } from "../components/AreasMap";
import QueriesRenderer from "../components/QueriesRenderer";
import { useAreasQuery } from "../state/queries/DiscreteQueries";

const AreasMapBox: React.FC<AreasMapProps> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        areas: useAreasQuery({
          pagination: { perPage: 20, page: 1 },
          filter: null,
          sort: {
            field: "id",
            order: "DESC",
          },
        }, false),
      }}
      render={({ areas }) => {
        return <AreasMap {...props} areas={areas.data} />;
      }}
    />
  );
};

export default AreasMapBox;
