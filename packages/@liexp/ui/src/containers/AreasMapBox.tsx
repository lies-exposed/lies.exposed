import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer.js";
import AreasMap, { type AreasMapProps } from "../components/area/AreasMap.js";

const AreasMapBox: React.FC<AreasMapProps> = (props) => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        areas: Q.Area.list.useQuery(undefined, undefined, false),
      })}
      render={({ areas }) => {
        return <AreasMap {...props} areas={areas.data} />;
      }}
    />
  );
};

export default AreasMapBox;
