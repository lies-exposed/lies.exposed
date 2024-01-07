import { eventRelationIdsMonoid } from "@liexp/shared/lib/helpers/event/event";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion";
import * as io from "@liexp/shared/lib/io";
import * as O from "fp-ts/Option";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button, useDataProvider } from "react-admin";
import { useNavigate } from "react-router";
import { Box, MenuItem, Select, Stack } from "../../mui";

export const CreateEventFromMediaButton: React.FC = () => {
  const record = useRecordContext();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.types[0].value,
  );

  const handleSubmit = async (): Promise<void> => {
    const suggestion = getSuggestions(
      {
        title: record.description.substr(0, 100),
        description: record.description,
      } as any,
      O.none,
      O.some(record as any),
      eventRelationIdsMonoid.empty,
    ).find((t) => t.event.type === type);

    const { newLinks, ...event }: any = suggestion?.event;
    const { data: e } = await apiProvider.create(`/events`, {
      data: event,
    });

    navigate(`/events/${e.id}`);
  };

  if (record?.events?.legnth > 0) {
    return <Box />;
  }

  return (
    <Stack direction={"row"} spacing={2}>
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
          void handleSubmit();
        }}
      />
    </Stack>
  );
};
