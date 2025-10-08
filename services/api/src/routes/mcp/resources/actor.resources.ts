import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
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

export const registerActorkResources = (
  server: McpServer,
  ctx: ServerContext,
) => {
  server.registerResource(
    "actor",
    new ResourceTemplate("actor://{id}", {
      list: (_extra) => {
        return pipe(
          fetchActors({})(ctx),
          fp.TE.map((a) => ({
            resources: a.results.map((a) => ({
              name: `${a.fullName} (${a.username})`,
              uri: `actor://${a.id}`,
              title: `Actor ${a.fullName} (${a.username})`,
              description: isValidValue(a.excerpt)
                ? getTextContents(a.excerpt)
                : a.fullName,
            })),
          })),
          throwTE,
        );
      },
    }),
    {
      title: "Get actor by its ID",
      description: "Retrieve an actor from DB by its UUID",
    },
    async (uri, { id, ..._rest }) => {
      return pipe(
        fetchActors({
          ids: O.some([id as UUID]),
        })(ctx),
        fp.TE.filterOrElse(
          (t) => t.total > 0,
          () => ServerError.of(["Can't find actor"]),
        ),
        fp.TE.map((a) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(a.results[0]),
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
