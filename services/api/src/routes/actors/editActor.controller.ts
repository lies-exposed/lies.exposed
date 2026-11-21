import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EditActorBody } from "@liexp/io/lib/http/Actor.js";
import {
  BlockNoteDocument,
  type BlockNoteDocument as BlockNoteDocumentType,
} from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { editActor } from "#flows/actors/editActor.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

const DocumentSchema = Schema.NullOr(BlockNoteDocument);
type DocumentType = typeof DocumentSchema.Type;
type DocumentEncoded = typeof DocumentSchema.Encoded;

type MemberInInputValue = Extract<
  EditActorBody["memberIn"],
  { _tag: "Some" }
>["value"];
type MemberInInputElement = MemberInInputValue[number];

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

export const MakeEditActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Actor.Edit,
    ({
      params: { id },
      body: { memberIn, bornOn, diedOn, avatar, nationalities, ...body },
    }) => {
      ctx.logger.info.log("Actor update for id %s", id);

      return pipe(
        TE.Do,
        TE.bind("excerpt", () =>
          decodeOption<DocumentType, DocumentEncoded>(
            DocumentSchema,
            "Invalid excerpt",
          )(body.excerpt),
        ),
        TE.bind("document", () =>
          decodeOption<DocumentType, DocumentEncoded>(
            DocumentSchema,
            "Invalid body",
          )(body.body),
        ),
        TE.bind("actor", ({ excerpt, document }) =>
          editActor({
            id,
            username: body.username,
            fullName: body.fullName,
            color: body.color,
            excerpt,
            body: document,
            bornOn: pipe(
              bornOn,
              O.map((d) => d.toISOString()),
            ),
            diedOn: pipe(
              diedOn,
              O.map((d) => d.toISOString()),
            ),
            avatar,
            nationalities,
            memberIn: pipe(
              memberIn,
              O.map((members) =>
                members.map((m): MemberInInputElement =>
                  typeof m === "string"
                    ? m
                    : {
                        ...m,
                        body: m.body as BlockNoteDocumentType,
                      },
                ),
              ),
            ),
          })(ctx),
        ),
        TE.map(({ actor }) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
