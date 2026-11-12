import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { type MediaType } from "@liexp/io/lib/http/Media/MediaType.js";
import * as http from "@liexp/io/lib/http/index.js";
import { eventRelationIdsMonoid } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { relationsTransformer } from "@liexp/shared/lib/providers/blocknote/transform.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { Schema } from "effect";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type RaRecord } from "react-admin";
import {
  type OnUploadProgressFn,
  uploadFile,
  type RawMedia,
} from "../../client/admin/MediaAPI.js";

export interface TransformMediaInput {
  fromURL?: boolean;
  id?: string;
  location?: { rawFile?: RawMedia; [key: string]: unknown };
  thumbnail?: string;
  [key: string]: unknown;
}

export interface TransformLinkInput {
  fromURL?: boolean;
  url?: string;
  publishDate?: Date;
  ids?: string[];
}

export const transformLinks = (
  links: TransformLinkInput[],
): (string | { url: string; publishDate: Date })[] => {
  return links.reduce<(string | { url: string; publishDate: Date })[]>(
    (acc, l) => {
      if (l.fromURL) {
        return [...acc, {
          url: l.url ?? "",
          publishDate: l.publishDate ?? new Date(),
        }];
      }
      return [...acc, ...(l.ids ?? [])];
    },
    [],
  );
};

export const transformMedia = (
  newMedia: TransformMediaInput[],
): (string | TransformMediaInput)[] => {
  return newMedia.reduce<(string | TransformMediaInput)[]>((acc, m) => {
    if (m.fromURL) {
      return [...acc, {
        ...m,
        thumbnail: m.location != null ? (m.location as unknown as string) : undefined,
      }];
    }

    if (m.id) {
      return [...acc, m.id];
    }

    return [...acc, m];
  }, []);
};

type TransformEventFn<D = Record<string, unknown>> = (
  data: D,
  relations: http.Events.EventRelationIds,
) => http.Events.CreateEventBody & { id: http.Common.UUID };

export const transformDeath: TransformEventFn = (data, _relations) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return {
    ...d,
    payload: {
      ...d.payload,
      location:
        d.payload.location === "" ? undefined : d.payload.location,
    },
  };
};

export const transformUncategorized: TransformEventFn = (data, relations) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  const { keywords, groups, actors } = eventRelationIdsMonoid.concat(
    {
      groups: d.payload.groups ?? [],
      actors: d.payload.actors ?? [],
      media: d.media ?? [],
      keywords: d.keywords ?? [],
      areas: d.payload.location ? [d.payload.location] : [],
      groupsMembers: [],
      links: d.links,
    },
    { ...relations, areas: [], groupsMembers: [] },
  );

  return {
    ...d,
    keywords,
    body: Array.isArray(d.body) && d.body.length > 0 ? d.body : null,
    payload: {
      ...d.payload,
      groups,
      actors,
      location:
        d.payload.location === "" ? undefined : d.payload.location,
      endDate:
        d.payload.endDate?.length > 0 ? d.payload.endDate : undefined,
    },
  };
};

export const transformScientificStudy: TransformEventFn = (data) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return {
    ...d,
    payload: {
      ...d.payload,
      publisher:
        d.payload.publisher === "" ? undefined : d.payload.publisher,
    },
  };
};

export const transformQuote: TransformEventFn = (data) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return {
    ...d,
    payload: {
      ...d.payload,
      quote: isValidValue(d.excerpt)
        ? getTextContents(d.excerpt).concat("\n\n")
        : "",
    },
  };
};

const transformBook: TransformEventFn = (data) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  return {
    ...d,
    payload: {
      ...d.payload,
      publisher: d.payload.publisher?.type
        ? d.payload.publisher
        : undefined,
    },
  };
};

const transformByType = (
  data: Record<string, unknown>,
  relations: http.Events.EventRelationIds,
): http.Events.CreateEventBody & { id: http.Common.UUID } => {
  switch (data.type) {
    case EVENT_TYPES.DEATH:
      return transformDeath(data, relations);
    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return transformScientificStudy(data, relations);
    case EVENT_TYPES.QUOTE:
      return transformQuote(data, relations);
    case EVENT_TYPES.BOOK:
      return transformBook(data, relations);
    default:
      return transformUncategorized(data, relations);
  }
};

export const transformEvent =
  (dataProvider: APIRESTClient) =>
  async (
    id: string,
    data: RaRecord,
    options?: { onUploadProgress: OnUploadProgressFn },
  ): Promise<RaRecord> => {
    // console.log("transform event", { ...data, id });
    const newLinks = transformLinks(data.newLinks ?? []);
    const links = (data.links ?? []).concat(newLinks);

    const newMedia = transformMedia(data.newMedia ?? []);
    const media: (TransformMediaInput | string)[] = (data.media ?? []).concat(
      newMedia,
    );

    const { rawMedia, otherMedia } = media.reduce<{
      rawMedia: TransformMediaInput[];
      otherMedia: (TransformMediaInput | string)[];
    }>(
      (acc, m) => {
        if (typeof m !== "string" && m.location?.rawFile !== undefined) {
          return {
            ...acc,
            rawMedia: acc.rawMedia.concat(m),
          };
        }
        return {
          ...acc,
          otherMedia: acc.otherMedia.concat(m),
        };
      },
      {
        rawMedia: [],
        otherMedia: [],
      },
    );

    const mediaTask = pipe(
      rawMedia.map((r: unknown) =>
        uploadFile(dataProvider)(
          "media",
          id,
          (r as RawMedia).location.rawFile,
          (r as RawMedia).location.rawFile.type as MediaType,
          options,
        ),
      ),
      A.sequence(TE.ApplicativePar),
      TE.map((urls) =>
        pipe(
          urls,
          A.zip(rawMedia),
          A.map(
            ([location, media]: [
              Record<string, unknown>,
              TransformMediaInput,
            ]) => ({
              ...media,
              ...location,
              thumbnail: Schema.is(http.Media.ImageType)(location.type)
                ? (location.location as string)
                : undefined,
            }),
          ),
          A.concat(otherMedia),
        ),
      ),
      TE.map((updatedMedia) => {
        return Array.isArray(media)
          ? media.concat(updatedMedia.filter((m) => !media.includes(m)))
          : updatedMedia;
      }),
    );

    const excerpt = isValidValue(data.excerpt) ? data.excerpt : null;

    const relations = relationsTransformer(excerpt ?? []);

    const event = transformByType(
      { ...data, excerpt },
      { ...relations, groupsMembers: [] },
    );

    return pipe(
      mediaTask,
      TE.map((media) => ({
        ...event,
        media,
        links,
      })),
      throwTE,
    );
  };
