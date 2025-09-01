import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import { TextInput } from "react-admin";
import { Stack } from "../../mui/index.js";
import ReferenceActorInput from "../actors/ReferenceActorInput.js";
import ReferenceArrayActorInput from "../actors/ReferenceArrayActorInput.js";
import ReferenceArrayGroupInput from "../groups/ReferenceArrayGroupInput.js";
import ReferenceArrayGroupMemberInput from "./ReferenceArrayGroupMemberInput.js";

interface EventFieldsFromTypeProps {
  eventType: EventType;
}
export const EventFieldsFromType: React.FC<EventFieldsFromTypeProps> = ({
  eventType,
}) => {
  const fields = React.useMemo(() => {
    switch (eventType) {
      case EVENT_TYPES.DEATH: {
        return (
          <Stack spacing={1} direction={"row"}>
            <ReferenceActorInput source={`payload.victim`} />
          </Stack>
        );
      }
      case EVENT_TYPES.UNCATEGORIZED:
      default: {
        return (
          <Stack>
            <TextInput source={`payload.title`} />
            <Stack direction="row" spacing={1}>
              <ReferenceArrayGroupInput source={`payload.groups`} />
              <ReferenceArrayActorInput source={`payload.actors`} />
              <ReferenceArrayGroupMemberInput
                source={`payload.groupsMembers`}
              />
            </Stack>
          </Stack>
        );
      }
    }
  }, [eventType]);

  return (
    <Stack spacing={2}>
      <Stack spacing={2}>{fields}</Stack>
    </Stack>
  );
};
