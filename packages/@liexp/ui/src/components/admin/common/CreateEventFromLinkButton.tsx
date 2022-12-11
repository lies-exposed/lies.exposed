import { getSuggestions } from "@liexp/shared/helpers/event-suggestion";
import * as io from "@liexp/shared/io";
import * as O from "fp-ts/Option";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button, useDataProvider } from "react-admin";
import { useNavigate } from "react-router";
import { Box, MenuItem, Select } from "../../mui";

export const CreateEventFromLinkButton: React.FC = () => {
  const record = useRecordContext();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.types[1].value
  );

  if (record?.events?.legnth > 0) {
    return <Box />;
  }

  return (
    <Box>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
        }}
      >
        {io.http.Events.EventType.types.map((t) => (
          <MenuItem key={t.value} value={t.value}>
            {t.value}
          </MenuItem>
        ))}
      </Select>
      <Button
        label="Create Event"
        variant="contained"
        onClick={() => {
          void apiProvider
            .get("open-graph/metadata", { url: record.url, type: "Link" })
            .then(async ({ data: { metadata: m } }: any) => {
              const suggestion = getSuggestions(m, O.some(record as any), O.none).find(
                (t) => t.event.type === type
              );

              const { newLinks, ...event } = suggestion?.event as any;
              const { data: e } = await apiProvider.create(`/events`, {
                data: {
                  ...event,
                  links: newLinks,
                },
              });
              navigate(`/events/${e.id}`);
            });
        }}
      />
    </Box>
  );
};
