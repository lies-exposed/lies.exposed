import { fp } from "@liexp/core/lib/fp/index.js";
import { transform } from "@liexp/shared/lib/helpers/event/event.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getEventCommonProps } from "@liexp/shared/lib/helpers/event/index.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import get from "lodash/get";
import * as React from "react";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRedirect,
  type FieldProps,
} from "react-admin";
import { useAPI } from "../../../../hooks/useAPI.js";
import { fetchRelations } from "../../../../state/queries/SearchEventsQuery.js";
import { getTextContents } from "../../../Common/BlockNote/utils/index.js";
import {
  Box,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "../../../mui/index.js";

export const EventTypeInput: React.FC<FieldProps> = ({ source }) => {
  const record = useRecordContext<Events.Event>();
  const redirect = useRedirect();
  const apiProvider = useDataProvider();
  const api = useAPI();

  const value = get(record, source ?? "type");
  const [type, setType] = React.useState(
    value ?? Events.EventTypes.UNCATEGORIZED.value,
  );
  const handleTransform = (e: SelectChangeEvent): void => {
    setType(e.target.value);
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
          getEventCommonProps(event, relations),
          (common) =>
            transform(getTextContents)(event, type, {
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

    // eslint-disable-next-line no-console
    // console.log(Events.Event.decode(plainEvent));

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

  return record && (
    <Box>
      <Select
        size="small"
        label="Transform in"
        placeholder="Select type"
        onChange={handleTransform}
        value={type}
        defaultValue={type}
      >
        {Events.EventType.types.map((t) => (
          <MenuItem key={t.value} value={t.value}>
            {t.value}
          </MenuItem>
        ))}
      </Select>
      <Button
        label="Transform"
        disabled={value === type}
        onClick={() => {
          void doTransform(record);
        }}
      />
    </Box>
  );
};
