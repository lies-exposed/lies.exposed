import { fp } from "@liexp/core/lib/fp/index.js";
import {
  EVENT_TYPES,
  type EventType,
} from "@liexp/io/lib/http/Events/EventType.js";
import { Events } from "@liexp/io/lib/http/index.js";
import { EventHelper } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import get from "lodash/get";
import * as React from "react";
import { useAPI } from "../../../../hooks/useAPI.js";
import { fetchRelations } from "../../../../state/queries/SearchEventsQuery.js";
import { EventIcon } from "../../../Common/Icons/EventIcon.js";
import {
  Box,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "../../../mui/index.js";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRedirect,
  type InputProps,
} from "../../react-admin.js";

export const EventTypeSelect: React.FC<{
  eventType?: EventType;
  onChange?: (type: EventType) => void;
}> = ({
  eventType: defaultEventType = EVENT_TYPES.UNCATEGORIZED,
  onChange,
}) => {
  const [eventType, setEventType] = React.useState<EventType>(defaultEventType);

  const onSelectChange = (e: SelectChangeEvent): void => {
    setEventType(e.target.value as EventType);
    onChange?.(e.target.value as EventType);
  };

  return (
    <Select
      size="small"
      label="Transform in"
      onChange={onSelectChange}
      value={eventType}
      defaultValue={defaultEventType}
    >
      {Events.EventType.members.map((t) => (
        <MenuItem key={t.literals[0]} value={t.literals[0]}>
          <EventIcon type={t.literals[0]} style={{ marginRight: 10 }} />{" "}
          {t.literals[0]}
        </MenuItem>
      ))}
    </Select>
  );
};

export const EventTypeInput: React.FC<
  Omit<InputProps, "onChange"> & {
    hideTransform?: boolean;
    onChange?: (type: EventType) => void;
  }
> = ({ source, defaultValue, onChange, hideTransform = false }) => {
  const record = useRecordContext<Events.Event>();
  const [type, setType] = React.useState(defaultValue);
  const redirect = useRedirect();
  const apiProvider = useDataProvider();
  const api = useAPI();

  const value: EventType = get(record, source ?? "type") ?? defaultValue;

  const onSelectChange = (eventType: EventType): void => {
    setType(eventType);
    onChange?.(eventType);
  };

  const doTransform = async (record: Events.Event): Promise<void> => {
    const { data: event } = await apiProvider.getOne("events", {
      id: record.id,
    });

    const plainEvent = await pipe(
      fetchRelations(api)(getRelationIds(event)),
      fp.TE.map((relations) => ({
        actors: relations.actors.data,
        media: relations.media.data,
        groups: relations.groups.data,
        groupsMembers: relations.groupsMembers.data,
        keywords: relations.keywords.data,
        links: relations.links.data,
        areas: [],
      })),
      fp.TE.map((relations) =>
        pipe(
          EventHelper.getCommonProps(event, relations),
          (common) =>
            EventHelper.transform(event, type, {
              ...common,
              ...getRelationIds(event),
            }),
          fp.O.toUndefined,
        ),
      ),
      throwTE,
    );

    if (!plainEvent) {
      throw new Error("No event matched");
    }

    await apiProvider
      .update("events", {
        id: record.id,
        data: plainEvent,
        previousData: record,
      })
      .then((e) => {
        const event: Events.Event = e.data;
        let resource;
        switch (event.type) {
          case "ScientificStudy": {
            resource = "scientific-studies";
            break;
          }
          case "Book": {
            resource = "books";
            break;
          }
          case "Death": {
            resource = "deaths";
            break;
          }
          case "Documentary": {
            resource = "documentaries";
            break;
          }
          case "Patent": {
            resource = "patents";
            break;
          }
          case "Transaction": {
            resource = "transactions";
            break;
          }
          case "Quote": {
            resource = "quotes";
            break;
          }
          default: {
            resource = "events";
          }
        }

        redirect("edit", resource, event.id);
      });
  };

  return (
    record && (
      <Box>
        <EventTypeSelect eventType={value} onChange={onSelectChange} />
        {!hideTransform && (
          <Button
            label="Transform"
            size="small"
            disabled={value === type}
            onClick={() => {
              void doTransform(record);
            }}
          />
        )}
      </Box>
    )
  );
};
