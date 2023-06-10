import { fp } from "@liexp/core/lib/fp";
import { getEventCommonProps } from "@liexp/shared/lib/helpers/event";
import {
  getRelationIds,
  transform,
} from "@liexp/shared/lib/helpers/event/event";
import { Events } from "@liexp/shared/lib/io/http";
import { toAPIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { get } from "lodash";
import * as React from "react";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRedirect,
  type FieldProps,
} from "react-admin";
import { foldTE } from "../../../../providers/DataProvider";
import { fetchRelations } from "../../../../state/queries/SearchEventsQuery";
import {
  fetchLinks,
  getLinksQueryKey,
} from "../../../../state/queries/link.queries";
import { Box, MenuItem, Select, type SelectChangeEvent } from "../../../mui";

export const EventTypeInput: React.FC<FieldProps> = ({ source }) => {
  const record = useRecordContext();
  const redirect = useRedirect();
  const apiProvider = useDataProvider();
  const value = get(record, source ?? "type");
  const [type, setType] = React.useState(
    value ?? Events.Uncategorized.UNCATEGORIZED.value
  );
  const handleTransform = (e: SelectChangeEvent): void => {
    setType(e.target.value);
  };

  const doTransform = async (): Promise<void> => {
    const { data: event } = await apiProvider.getOne("events", {
      id: record.id,
    });

    const plainEvent = await pipe(
      sequenceS(fp.TE.ApplicativePar)({
        relations: fetchRelations(getRelationIds(event)),
        links: pipe(
          fp.TE.tryCatch(
            () =>
              fetchLinks({
                queryKey: getLinksQueryKey(
                  {
                    filter: {
                      ids: event.links,
                    },
                  },
                  true
                ),
              }),
            toAPIError
          )
        ),
      }),
      fp.TE.map(({ relations, links }) => ({
        actors: relations.actors.data,
        media: relations.media.data,
        groups: relations.groups.data,
        groupsMembers: relations.groupsMembers.data,
        keywords: relations.keywords.data,
        links,
      })),
      fp.TE.map((relations) =>
        pipe(
          getEventCommonProps(event, relations),
          (common) =>
            transform(event, type, {
              ...common,
              ...getRelationIds(event),
              links: relations.links.data.map((l) => l.id),
            }),
          fp.O.toUndefined
        )
      ),
      foldTE
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
          void doTransform();
        }}
      />
    </Box>
  );
};
