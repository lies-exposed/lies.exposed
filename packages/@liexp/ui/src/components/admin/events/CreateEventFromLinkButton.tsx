import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreateEventPlainBody } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Link } from "@liexp/shared/lib/io/http/Link.js";
import type * as io from "@liexp/shared/lib/io/index.js";
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

  const [{ error, isCreating }, setState] = React.useState<{
    error: Error | undefined;
    isCreating: boolean;
  }>({
    error: undefined,
    isCreating: false,
  });

  const { type, payload } = React.useMemo((): {
    payload: io.http.Events.EventPayload;
    type: io.http.Events.EventType;
  } => {
    const { payload, type } = formGroupState.getValues();
    if (!type) {
      formGroupState.setValue("type", EVENT_TYPES.UNCATEGORIZED);
    }
    return { payload, type };
  }, [formGroupState.getValues()]);

  // Pre-populate event payload with link values
  React.useEffect(() => {
    if (!record) return;

    const currentPayload = formGroupState.getValues("payload");
    const currentType =
      formGroupState.getValues("type") ?? EVENT_TYPES.UNCATEGORIZED;

    // Only set defaults if payload is not already populated
    if (!currentPayload || Object.keys(currentPayload).length === 0) {
      if (currentType === EVENT_TYPES.UNCATEGORIZED) {
        formGroupState.setValue("payload", {
          title: record.title,
          actors: [],
          groups: [],
          groupsMembers: [],
        });
      }
    }
  }, [record, formGroupState]);

  // Update payload when event type changes
  React.useEffect(() => {
    if (!record || !type) return;

    const currentPayload = formGroupState.getValues("payload");

    // Reset payload to link defaults when switching to UNCATEGORIZED
    if (type === EVENT_TYPES.UNCATEGORIZED) {
      if (!currentPayload?.title) {
        formGroupState.setValue("payload.title", record.title);
      }
      // Initialize arrays if they don't exist
      if (!currentPayload?.actors) {
        formGroupState.setValue("payload.actors", []);
      }
      if (!currentPayload?.groups) {
        formGroupState.setValue("payload.groups", []);
      }
      if (!currentPayload?.groupsMembers) {
        formGroupState.setValue("payload.groupsMembers", []);
      }
    }
  }, [type, record, formGroupState]);

  const createEvent = React.useCallback(
    async (event: CreateEventPlainBody): Promise<void> => {
      setState({ error: undefined, isCreating: true });
      await pipe(apiProvider.Endpoints.Event.post(event), throwTE)
        .then((response) => {
          if ("id" in response) {
            // Event created successfully
            return navigate(`/events/${response.id}`);
          }
        })
        .catch((e) => {
          setState({ error: e, isCreating: false });
        });
    },
    [navigate, apiProvider],
  );

  if (!record || record?.events?.length > 0) {
    return <Box />;
  }

  return (
    <Stack spacing={2}>
      <Stack spacing={2}>
        <EventTypeInput
          source="type"
          defaultValue={EVENT_TYPES.UNCATEGORIZED}
          hideTransform={true}
          onChange={(value) => {
            formGroupState.setValue("type", value);
            void formGroupState.trigger();
          }}
        />
        <Stack>
          <EventFieldsFromType eventType={type} />

          <Button
            label="Create Event"
            variant="contained"
            disabled={!payload || isCreating}
            onClick={() => {
              void createEvent({
                payload,
                type,
                date: new Date(record.publishDate ?? new Date()),
                excerpt: record.description ?? "",
                body: undefined,
                draft: true,
                links: [record.id],
                media: record.image?.id ? [record.image.id] : [],
                keywords: record.keywords ?? [],
              } as CreateEventPlainBody);
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
                  isCreating: false,
                });
              }}
            />
          </Stack>
        ) : null}
      </Stack>
    </Stack>
  );
};
