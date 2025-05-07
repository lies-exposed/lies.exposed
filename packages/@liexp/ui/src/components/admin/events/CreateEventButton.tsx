import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateEventBody } from "@liexp/shared/lib/io/http/Events/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as React from "react";
import {
  Button,
  type RaRecord,
  useRecordContext,
  useDataProvider,
} from "react-admin";
import { useNavigate } from "react-router";
import { Box, MenuItem, Select } from "../../mui/index.js";
interface CreateEventButtonProps {
  transform: (
    t: io.http.Events.EventType,
    record: RaRecord<UUID>,
  ) => Promise<CreateEventBody>;
}

export const CreateEventButton: React.FC<CreateEventButtonProps> = ({
  transform,
}) => {
  const record = useRecordContext<RaRecord<UUID>>();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<io.http.Events.EventType>(
    io.http.Events.EventType.members[1].literals[0],
  );

  if (!record) {
    return null;
  }

  return (
    <Box style={{ display: "flex", alignItems: "center", padding: 10 }}>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          setType(e.target.value as any);
        }}
        style={{
          marginRight: 20,
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
        size="small"
        onClick={() => {
          void transform(type, record).then(async (r) => {
            const { data: e } = await apiProvider.create(`/events`, {
              data: r,
            });
            await navigate(`/events/${e.id}`);
          });
        }}
      />
    </Box>
  );
};
