import * as io from "@liexp/shared/lib/io";
import { type CreateEventBody } from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import {
  Button,
  type RaRecord,
  useRecordContext,
  useDataProvider,
} from "react-admin";
import { useNavigate } from "react-router";
import { Box, MenuItem, Select } from "../../mui";

interface CreateEventButtonProps {
  transform: (
    t: io.http.Events.EventType,
    record: RaRecord,
  ) => Promise<CreateEventBody>;
}

export const CreateEventButton: React.FC<CreateEventButtonProps> = ({
  transform,
}) => {
  const record = useRecordContext();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<io.http.Events.EventType>(
    io.http.Events.EventType.types[1].value,
  );

  return (
    <Box style={{ display: "flex", alignItems: "center", padding: 10 }}>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          setType(e.target.value as any);
        }}
        style={{
          marginRight: 20,
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
        size="small"
        onClick={() => {
          void transform(type, record).then(async (r) => {
            const { data: e } = await apiProvider.create(`/events`, {
              data: r,
            });
            navigate(`/events/${e.id}`);
          });
        }}
      />
    </Box>
  );
};
