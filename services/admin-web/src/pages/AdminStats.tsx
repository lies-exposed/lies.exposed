import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { Queries } from "@liexp/ui/lib/providers/DataProvider.js";
import { fetchQuery } from "@liexp/ui/lib/state/queries/common.js";
import { useDataProvider } from 'ra-core';
import * as React from "react";
import { useQuery } from "react-query";

export const AdminStats: React.FC = () => {

  return (
    <div>
      <QueriesRenderer
        queries={{
          media: useQuery(
            ["orphan", "media"],
            fetchQuery(Queries.Admin.Custom.GetOrphanMedia),
          ),
        }}
        render={({ media }) => {
          console.log(media);
          return <h1>Total orphan media: {media.length}</h1>;
        }}
      />
    </div>
  );
};
