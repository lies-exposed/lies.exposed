import { fetchLinks } from "@liexp/backend/lib/queries/links/fetchLinks.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import {
  ResourceTemplate,
  type McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as O from "effect/Option";
import { type ServerContext } from "../../../context/context.type.js";

export const registerLinkResources = (
  server: McpServer,
  ctx: ServerContext,
) => {
  server.registerResource(
    "link",
    new ResourceTemplate("link://{id}", {
      list: (extra) => {
        return pipe(
          fetchLinks({}, true)(ctx),
          fp.TE.map(([links]) => ({
            resources: links.map((link) => ({
              name: link.title,
              uri: `link://${link.id}`,
              title: `Link: ${link.title}`,
              description: link.description ?? link.title,
            })),
          })),
          throwTE,
        );
      },
    }),
    {
      title: "Get link by its ID",
      description: "Retrieve a link from DB by its UUID",
    },
    async (uri, { id }) => {
      return pipe(
        fetchLinks(
          {
            ids: O.some((Array.isArray(id) ? id : [id]) as UUID[]),
          },
          true,
        )(ctx),
        fp.TE.filterOrElse(
          ([links]) => links.length > 0,
          () => new Error("Link not found"),
        ),
        fp.TE.map(([links]) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(links[0]),
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
