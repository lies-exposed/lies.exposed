import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { editGroup } from "#flows/groups/editGroup.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

const DocumentSchema = Schema.NullOr(BlockNoteDocument);
type DocumentType = typeof DocumentSchema.Type;
type DocumentEncoded = typeof DocumentSchema.Encoded;

const MembersSchemaBase = Schema.Array(
  Schema.Union(
    UUID,
    Schema.Struct({
      actor: UUID,
      body: OptionFromNullishToNull(BlockNoteDocument),
      startDate: Schema.Date,
      endDate: OptionFromNullishToNull(Schema.NullOr(Schema.Date)),
    }),
  ),
);
type MembersType = typeof MembersSchemaBase.Type;
type MembersEncoded = typeof MembersSchemaBase.Encoded;

const decodeOption =
  <A, I>(
    schema: Schema.Schema<A, I>,
    message: string,
  ): ((
    value: O.Option<unknown>,
  ) => TE.TaskEither<ControllerError, O.Option<A>>) =>
  (value): TE.TaskEither<ControllerError, O.Option<A>> =>
    O.isNone(value)
      ? TE.right(O.none())
      : TE.fromEither(
          pipe(
            Schema.decodeUnknownEither(schema)(value.value),
            fp.E.mapLeft((e) => DecodeError.of(message, e)),
            fp.E.map(O.some),
          ),
        );

export const MakeEditGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Group.Edit,
    ({
      params: { id },
      body: { members, avatar, startDate, endDate, excerpt, body, ...rest },
    }) => {
      ctx.logger.debug.log("Updating group with id %s", id);

      return pipe(
        TE.Do,
        TE.bind("excerpt", () =>
          decodeOption<DocumentType, DocumentEncoded>(
            DocumentSchema,
            "Invalid excerpt",
          )(excerpt),
        ),
        TE.bind("document", () =>
          decodeOption<DocumentType, DocumentEncoded>(
            DocumentSchema,
            "Invalid body",
          )(body),
        ),
        TE.bind("groupMembers", () =>
          decodeOption<MembersType, MembersEncoded>(
            MembersSchemaBase,
            "Invalid members",
          )(members),
        ),
        TE.bind("data", ({ excerpt: ex, document, groupMembers }) =>
          editGroup({
            id,
            name: rest.name,
            username: rest.username,
            color: rest.color,
            kind: rest.kind,
            excerpt: ex,
            body: document,
            avatar,
            startDate: pipe(
              startDate,
              O.map((d) => d.toISOString()),
            ),
            endDate: pipe(
              endDate,
              O.map((d) => d.toISOString()),
            ),
            members: groupMembers,
          })(ctx),
        ),
        TE.map(({ data }) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
