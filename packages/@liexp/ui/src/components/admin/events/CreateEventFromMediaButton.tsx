import { eventRelationIdsMonoid } from "@liexp/shared/lib/helpers/event/event.js";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/lib/Option.js";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button, useDataProvider } from "react-admin";
import { useNavigate } from "react-router";
import { toBNDocument } from "../../Common/BlockNote/utils/utils.js";
import { Box, MenuItem, Select, Stack } from "../../mui/index.js";

export const CreateEventFromMediaButton: React.FC = () => {
  const record = useRecordContext<Media>();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.members[0].literals[0],
  );

  const handleSubmit = async (media: Media): Promise<void> => {
    const suggestion = await getSuggestions(toBNDocument)(
      {
        title: media.label ?? media.description?.substring(0, 100),
        description: media.description,
      } as any,
      O.none,
      O.some(media as any),
      eventRelationIdsMonoid.empty,
    ).then((suggestions) => suggestions.find((t) => t.event.type === type));

    const { newLinks: _newLinks, ...event }: any = suggestion?.event ?? {
      newLinks: [],
    };
    const { data: e } = await apiProvider.create(`/events`, {
      data: event,
    });

    navigate(`/events/${e.id}`);
  };

  if (!record) {
    return <Box />;
  }

  if (record?.events?.length ?? 0 > 0) {
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
        {io.http.Events.EventType.members.map((t) => (
          <MenuItem key={t.literals[0]} value={t.literals[0]}>
            {t.literals[0]}
          </MenuItem>
        ))}
      </Select>
      <Button
        label="Create Event"
        variant="contained"
        onClick={() => {
          void handleSubmit(record);
        }}
      />
    </Stack>
  );
};
