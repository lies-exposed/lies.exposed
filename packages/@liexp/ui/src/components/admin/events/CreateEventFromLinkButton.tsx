import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import {
  type CreateEventPlainBody,
  type EventType,
} from "@liexp/io/lib/http/Events/index.js";
import { type Link } from "@liexp/io/lib/http/Link.js";
import type * as io from "@liexp/io/lib/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useEndpointsRESTClient } from "../../../hooks/useEndpointRestClient.js";
import { ErrorBox } from "../../Common/ErrorBox.js";
import { Box, Stack } from "../../mui/index.js";
import { EventFieldsFromType } from "../common/EventFieldsFromType.js";
import { EventTypeInput } from "../common/inputs/EventTypeInput.js";
import { Button, useRecordContext } from "../react-admin.js";

/**
 * Maps link values to event payload based on event type
 */
const getPayloadFromLink = (
  link: Link,
  eventType: EventType,
  currentPayload?: any,
): any => {
  switch (eventType) {
    case EVENT_TYPES.UNCATEGORIZED:
      return {
        title: currentPayload?.title ?? link.title,
        actors: currentPayload?.actors ?? [],
        groups: currentPayload?.groups ?? [],
        groupsMembers: currentPayload?.groupsMembers ?? [],
        location: currentPayload?.location ?? undefined,
        endDate: currentPayload?.endDate ?? undefined,
      };

    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return {
        title: currentPayload?.title ?? link.title,
        url: currentPayload?.url ?? link.id,
        authors: currentPayload?.authors ?? [],
        publisher: currentPayload?.publisher ?? undefined,
        image: currentPayload?.image ?? link.image?.id ?? undefined,
      };

    case EVENT_TYPES.DOCUMENTARY:
      return {
        title: currentPayload?.title ?? link.title,
        media: currentPayload?.media ?? undefined,
        website: currentPayload?.website ?? link.id ?? undefined,
        authors: currentPayload?.authors ?? {
          actors: [],
          groups: [],
        },
        subjects: currentPayload?.subjects ?? {
          actors: [],
          groups: [],
        },
      };

    case EVENT_TYPES.QUOTE:
      return {
        actor: currentPayload?.actor ?? undefined,
        subject: currentPayload?.subject ?? undefined,
        quote: currentPayload?.quote ?? link.title ?? undefined,
        details: currentPayload?.details ?? link.description ?? undefined,
      };

    case EVENT_TYPES.TRANSACTION:
      return {
        title: currentPayload?.title ?? link.title,
        total: currentPayload?.total ?? 0,
        currency: currentPayload?.currency ?? "EUR",
        from: currentPayload?.from ?? undefined,
        to: currentPayload?.to ?? undefined,
      };

    case EVENT_TYPES.DEATH:
      return {
        victim: currentPayload?.victim ?? undefined,
        location: currentPayload?.location ?? undefined,
      };

    default:
      return {
        title: link.title ?? "",
      };
  }
};

export const CreateEventFromLinkButton: React.FC = () => {
  const record = useRecordContext<Link>();
  const navigate = useNavigate();
  const apiProvider = useEndpointsRESTClient();
  const formGroupState = useForm();

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
      const defaultPayload = getPayloadFromLink(record, currentType);
      formGroupState.setValue("payload", defaultPayload);
    }
  }, [record, formGroupState]);

  // Update payload when event type changes
  React.useEffect(() => {
    if (!record || !type) return;

    const currentPayload = formGroupState.getValues("payload");
    const updatedPayload = getPayloadFromLink(record, type, currentPayload);
    formGroupState.setValue("payload", updatedPayload);
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
