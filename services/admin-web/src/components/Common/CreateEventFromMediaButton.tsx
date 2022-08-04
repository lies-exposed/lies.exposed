import { getSuggestions } from "@liexp/shared/helpers/event-suggestion";
import * as io from "@liexp/shared/io";
import { Box, MenuItem, Select } from "@liexp/ui/components/mui";
import * as O from "fp-ts/lib/Option";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button } from "react-admin";
import { useNavigate } from "react-router";
import { apiProvider } from "@client/HTTPAPI";

export const CreateEventFromMediaButton: React.FC = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.types[1].value
  );

  const handleSubmit = async (): Promise<void> => {
    const suggestion = getSuggestions(
      {
        title: record.description.substr(0, 100),
        description: record.description,
      },
      O.none,
      O.some(record as any)
    ).find((t) => t.event.type === type);

    const { newLinks, ...event } = suggestion.event;
    const { data: e } = await apiProvider.create(`/events`, {
      data: event,
    });

    return navigate(`/events/${e.id}`);
  };

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
          void handleSubmit();
        }}
      />
    </Box>
  );
};
