import { toGetNetworkQuery } from "@liexp/shared/lib/helpers/event/event.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { type FlowGraphType } from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import { type Network } from "@liexp/shared/lib/io/http/index.js";
import { useRecordContext, useRefresh } from "ra-core";
import { Button, LoadingIndicator } from "ra-ui-materialui";
import * as React from "react";
import { apiProvider } from "../../../../client/api.js";
import { EventsFlowGraphBox } from "../../../../containers/graphs/EventsFlowGraphBox.js";
import { Grid } from "../../../mui/index.js";

export const EventsFlowGraphFormTab: React.FC<{ type: FlowGraphType }> = ({
  type,
}) => {
  const record = useRecordContext();
  const refresh = useRefresh();

  const handleRegenerateFlow = (): void => {
    void apiProvider
      .put(`graphs/flows/${type}/${id}`, { regenerate: true })
      .then(() => {
        refresh();
      });
  };

  if (!record?.id) {
    return <LoadingIndicator />;
  }

  const id: any = record.id;

  const query: Network.GetNetworkQuerySerialized =
    type === "events"
      ? toGetNetworkQuery(getRelationIds(record as any))
      : {
          ids: null,
          keywords: null,
          groups: null,
          actors: null,
          relations: ["actors", "groups", "keywords"],
          startDate: null,
          endDate: null,
          emptyRelations: null,
        };

  return (
    <div>
      <Grid container>
        <Grid item md={8}>
          <EventsFlowGraphBox
            type="events"
            id={id}
            query={query}
            onEventClick={() => {}}
          />
        </Grid>
        <Grid item md={4}>
          <Button
            variant="contained"
            label="Regenerate"
            onClick={handleRegenerateFlow}
          />
        </Grid>
      </Grid>
    </div>
  );
};
