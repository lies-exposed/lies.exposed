import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import {
  ResourceTemplate,
  type McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as O from "effect/Option";
import { type ServerContext } from "../../../context/context.type.js";

export const registerEventResources = (
  server: McpServer,
  ctx: ServerContext,
) => {
  server.registerResource(
    "event",
    new ResourceTemplate("event://{id}", {
      list: (extra) => {
        return pipe(
          searchEventV2Query({ take: 50 })(ctx),
          fp.TE.chainEitherK((e) => EventV2IO.decodeMany(e.results)),
          fp.TE.map((events) => ({
            resources: events.map((event) => {
              const searchEvent = toSearchEvent(event, {
                actors: [],
                groups: [],
                groupsMembers: [],
                media: [],
                keywords: [],
                links: [],
                areas: [],
              });
              const title = getTitleForSearchEvent(searchEvent);
              const description = isValidValue(event.excerpt)
                ? getTextContents(event.excerpt)
                : title;
              return {
                name: title,
                uri: `event://${event.id}`,
                title: `Event: ${title}`,
                description,
              };
            }),
          })),
          throwTE,
        );
      },
    }),
    {
      title: "Get event by its ID",
      description: "Retrieve an event from DB by its UUID",
    },
    async (uri, { id }) => {
      return pipe(
        searchEventV2Query({
          ids: O.some([id as UUID]),
        })(ctx),
        fp.TE.filterOrElse(
          (e) => e.total > 0,
          () => ServerError.of(["Event not found"]),
        ),
        fp.TE.chainEitherK((e) => EventV2IO.decodeSingle(e.results[0])),
        fp.TE.map((event) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(event),
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
