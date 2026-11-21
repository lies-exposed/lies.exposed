import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { CreateEventSuggestion } from "@liexp/io/lib/http/EventSuggestion.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { AdminEdit } from "@liexp/io/lib/http/auth/permissions/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toEventSuggestion } from "./eventSuggestion.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

type StoredSuggestionEvent = CreateEventSuggestion["event"];

const toEditEventBody = (
  event: StoredSuggestionEvent,
): Events.EditEventBody => {
  const common = {
    excerpt: O.some(event.excerpt),
    body: O.some(event.body),
    draft: O.some(event.draft),
    date: O.some(event.date),
    keywords: O.some(event.keywords),
    media: O.some(event.media),
    links: O.some(event.links),
  };

  switch (event.type) {
    case "Book": {
      const { title, media, authors, publisher } = event.payload;
      return {
        ...common,
        type: "Book",
        payload: {
          title: O.some(title),
          media: O.some({
            pdf: media.pdf,
            audio:
              media.audio === undefined || media.audio === null
                ? O.none()
                : O.some(media.audio),
          }),
          authors: O.some(authors),
          publisher:
            publisher === undefined || publisher === null
              ? O.none()
              : O.some(publisher),
        },
      };
    }
    case "Death": {
      const { victim, location } = event.payload;
      return {
        ...common,
        type: "Death",
        payload: {
          victim: O.some(victim),
          location:
            location === undefined || location === null
              ? O.none()
              : O.some(location),
        },
      };
    }
    case "Patent": {
      const { title, owners, source } = event.payload;
      return {
        ...common,
        type: "Patent",
        payload: {
          title: O.some(title),
          owners: O.some(owners),
          source:
            source === undefined || source === null ? O.none() : O.some(source),
        },
      };
    }
    case "ScientificStudy": {
      const { title, url, image, authors, publisher } = event.payload;
      return {
        ...common,
        type: "ScientificStudy",
        payload: {
          title: O.some(title),
          url: O.some(url),
          image:
            image === undefined || image === null ? O.none() : O.some(image),
          authors: O.some(authors),
          publisher:
            publisher === undefined || publisher === null
              ? O.none()
              : O.some(publisher),
        },
      };
    }
    case "Documentary": {
      const { title, media, website, authors, subjects } = event.payload;
      return {
        ...common,
        type: "Documentary",
        payload: {
          title: O.some(title),
          media: O.some(media),
          website:
            website === undefined || website === null
              ? O.none()
              : O.some(website),
          authors: O.some(authors),
          subjects: O.some(subjects),
        },
      };
    }
    case "Transaction": {
      const { title, total, currency, from, to } = event.payload;
      return {
        ...common,
        type: "Transaction",
        payload: {
          title: O.some(title),
          total: O.some(total),
          currency: O.some(currency),
          from: O.some(from),
          to: O.some(to),
        },
      };
    }
    case "Quote": {
      const { actor, subject, quote, details } = event.payload;
      return {
        ...common,
        type: "Quote",
        payload: {
          actor:
            actor === undefined || actor === null ? O.none() : O.some(actor),
          subject:
            subject === undefined || subject === null
              ? O.none()
              : O.some(subject),
          quote:
            quote === undefined || quote === null ? O.none() : O.some(quote),
          details:
            details === undefined || details === null
              ? O.none()
              : O.some(details),
        },
      };
    }
    case "Uncategorized":
    default: {
      const { title, location, endDate, actors, groups, groupsMembers } =
        event.payload;
      return {
        ...common,
        type: "Uncategorized",
        payload: {
          title: O.some(title),
          location:
            location === undefined || location === null
              ? O.none()
              : O.some(location),
          endDate:
            endDate === undefined || endDate === null
              ? O.none()
              : O.some(endDate),
          actors: O.some(actors),
          groups: O.some(groups),
          groupsMembers: O.some(groupsMembers),
        },
      };
    }
  }
};

export const EditEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminEdit.literals[0]])(ctx))(
    Endpoints.Event.Custom.EditSuggestion,
    ({ params: { id }, body: { creator, payload: body } }) => {
      ctx.logger.debug.log("Suggestion body %O", body);
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) =>
          pipe(
            editEventQuery(
              {
                stories: [],
                actors: [],
                groups: [],
                location: null,
                ...suggestion.payload.event,
                links: [...suggestion.payload.event.links],
                media: [...suggestion.payload.event.media],
                keywords: [...suggestion.payload.event.keywords],
                socialPosts: [],
                createdAt: suggestion.createdAt,
                updatedAt: suggestion.updatedAt,
                id: suggestion.id,
                deletedAt: null,
              },
              toEditEventBody(body.event),
            )(ctx),
            TE.chain((event) =>
              pipe(
                Schema.decodeUnknownEither(CreateEventSuggestion)({
                  ...body,
                  event: {
                    ...body.event,
                    ...event,
                    excerpt: event.excerpt ?? undefined,
                    body: event.body ?? undefined,
                  },
                }),
                fp.E.mapLeft((e) =>
                  DecodeError.of("Invalid event suggestion payload", e),
                ),
                TE.fromEither,
                TE.chain((payload) =>
                  ctx.db.save(EventSuggestionEntity, [
                    {
                      ...suggestion,
                      creator: creator
                        ? { id: creator }
                        : { id: suggestion.creator.id },
                      payload,
                      id,
                      status: "PENDING",
                    },
                  ]),
                ),
              ),
            ),
          ),
        ),
        TE.chainEitherK(([d]) => toEventSuggestion(d)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
