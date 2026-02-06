import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { FullSizeLoader } from "../Common/FullSizeLoader.js";
import { EntitreeGraph } from "../Common/Graph/Flow/EntitreeGraph/EntitreeGraph.js";
import { toEntitreeMap } from "../Common/Graph/Flow/EntitreeGraph/toEntitreeMap.js";
import { Box, Typography } from "../mui/index.js";

export interface ActorFamilyTreeProps {
  actorId: UUID;
  height?: number;
}

export const ActorFamilyTree: React.FC<ActorFamilyTreeProps> = ({
  actorId,
  height = 600,
}) => {
  const Queries = useEndpointQueries();
  const { data, isLoading, error } = Queries.ActorRelation.Custom.Tree.useQuery(
    { id: actorId },
  );

  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">
          Error loading family tree: {error.message}
        </Typography>
      </Box>
    );
  }

  const treeData = data?.data;

  if (!treeData || Object.keys(treeData).length === 0) {
    return (
      <Box p={2}>
        <Typography>No family tree data available</Typography>
      </Box>
    );
  }

  const entitreeMap = toEntitreeMap(treeData);

  return (
    <Box
      style={{
        height,
        width: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <EntitreeGraph tree={entitreeMap} rootId={actorId} />
    </Box>
  );
};
