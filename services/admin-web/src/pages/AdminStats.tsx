import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import * as React from "react";

export const AdminStats: React.FC = () => {
  return (
    <div>
      <QueriesRenderer
        queries={(Q) => ({
          media: Q.Admin.Custom.GetOrphanMedia.useQuery(undefined),
        })}
        render={({ media: { data: media } }) => {
          return <h1>Total orphan media: {media.length}</h1>;
        }}
      />
    </div>
  );
};
