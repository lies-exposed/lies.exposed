import { type EventFromURLBody } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Link } from "@liexp/shared/lib/io/http/Link.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router";
import { useEndpointsRESTClient } from "../../../hooks/useEndpointRestClient.js";
import { ErrorBox } from "../../Common/ErrorBox.js";
import { Box, Stack } from "../../mui/index.js";
import { EventFieldsFromType } from "../common/EventFieldsFromType.js";
import { EventTypeInput } from "../common/inputs/EventTypeInput.js";
import { Button, useRecordContext } from "../react-admin.js";

export const CreateEventFromLinkButton: React.FC = () => {
  const record = useRecordContext<Link>();
  const navigate = useNavigate();
  const apiProvider = useEndpointsRESTClient();
  const formGroupState = useFormContext();

  const [{ error }, setState] = React.useState<{
    error: Error | undefined;
  }>({
    error: undefined,
  });

  const { type, payload } = React.useMemo((): {
    payload: io.http.Events.EventPayload;
    type: io.http.Events.EventType;
  } => {
    const { payload, type } = formGroupState.getValues();
    if (!type) {
      formGroupState.setValue(
        "type",
        io.http.Events.EventTypes.UNCATEGORIZED.value,
      );
    }
    return { payload, type };
  }, [formGroupState.getValues()]);

  const createEvent = React.useCallback(
    async (event: EventFromURLBody): Promise<void> => {
      setState({ error: undefined });
      await pipe(apiProvider.Endpoints.Event.post(event), throwTE)
        .then((event) => {
          navigate(`/events/${event.id}`);
        })
        .catch((e) => {
          setState({ error: e });
        });
    },
    [record, type],
  );

  if (!record || record?.events?.length > 0) {
    return <Box />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row">
        <EventTypeInput
          source="type"
          defaultValue={io.http.Events.EventTypes.UNCATEGORIZED.value}
          onChange={(value) => {
            formGroupState.setValue("type", value);
            void formGroupState.trigger();
          }}
        />
        <EventFieldsFromType eventType={type} />

        <Button
          label="Create Event"
          variant="contained"
          disabled={!payload}
          onClick={() => {
            void createEvent({
              payload,
              type,
              url: record.url,
              links: [record.id],
              media: [],
              keywords: [],
            } as EventFromURLBody);
          }}
        />
      </Stack>
      {error ? (
        <Stack>
          <ErrorBox
            error={error}
            resetErrorBoundary={() => {
              formGroupState.resetField("payload");
              setState({
                error: undefined,
              });
            }}
          />
        </Stack>
      ) : null}
    </Stack>
  );
};
