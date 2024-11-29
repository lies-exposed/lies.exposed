import { toGetNetworkQuery } from "@liexp/shared/lib/helpers/event/event.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { type FlowGraphType } from "@liexp/shared/lib/io/http/graphs/FlowGraph.js";
import { type Network } from "@liexp/shared/lib/io/http/index.js";
import { useRecordContext, useRefresh } from "ra-core";
import { Button, LoadingIndicator } from "ra-ui-materialui";
import * as React from "react";
import { EventsFlowGraphBox } from "../../../../containers/graphs/EventsFlowGraphBox.js";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { Grid } from "../../../mui/index.js";

export const EventsFlowGraphFormTab: React.FC<{ type: FlowGraphType }> = ({
  type,
}) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

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
      ? toGetNetworkQuery(getRelationIds(record as Event))
      : {
          ids: null,
          keywords: type === "keywords" ? [id] : null,
          groups: type === "groups" ? [id] : null,
          actors: type === "actors" ? [id] : null,
          relations: ["actors", "groups", "keywords"],
          startDate: null,
          endDate: null,
          emptyRelations: null,
        };

  return (
    <Grid container width={"100%"}>
      <Grid item md={10}>
        <EventsFlowGraphBox
          type={type}
          id={id}
          query={query}
          onEventClick={() => {}}
        />
      </Grid>
      <Grid item md={2}>
        <Button
          variant="contained"
          label="Regenerate"
          onClick={handleRegenerateFlow}
        />
      </Grid>
    </Grid>
  );
};
