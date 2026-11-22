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
} from "../../client/admin/MediaAPI.js";

type FormLinkOutput = string | { url: string; publishDate: Date };

interface FormNewLinkInput {
  fromURL: boolean;
  url: string;
  publishDate?: Date | null;
}

interface FormExistingLinkInput {
  ids: string[];
}

type FormLinkInput = FormNewLinkInput | FormExistingLinkInput;

const isFormNewLink = (l: FormLinkInput): l is FormNewLinkInput =>
  "fromURL" in l;

export const transformLinks = (links: FormLinkInput[]): FormLinkOutput[] => {
  return links.reduce<FormLinkOutput[]>((acc, l) => {
    if (isFormNewLink(l)) {
      return acc.concat({
        url: l.url,
        publishDate: l.publishDate ?? new Date(),
      });
    }
    return acc.concat(l.ids);
  }, []);
};

export interface FormDraftMedia {
  id?: string;
  fromURL?: boolean;
  location?: unknown;
  thumbnail?: unknown;
}

interface FormRawMedia extends FormDraftMedia {
  location: { rawFile: File };
  type: MediaType;
}

export type FormMediaEntry = string | FormDraftMedia;

const isFormRawMedia = (m: FormMediaEntry): m is FormRawMedia =>
  typeof m === "object" &&
  typeof m.location === "object" &&
  m.location !== null &&
  "rawFile" in m.location;

export const transformMedia = (
  newMedia: FormMediaEntry[],
): FormMediaEntry[] => {
  return newMedia.reduce<FormMediaEntry[]>((acc, m) => {
    if (typeof m === "string") {
      return acc.concat(m);
    }

    if (m.fromURL) {
      return acc.concat({
        ...m,
        thumbnail: m.location,
      });
    }

    if (m.id) {
      return acc.concat(m.id);
    }

    return acc.concat(m);
  }, []);
};

type TransformEventResult = http.Events.CreateEventBody & {
  id: http.Common.UUID;
};

type TransformEventFn<D = RaRecord> = (
  data: D,
  relations: http.Events.EventRelationIds,
) => TransformEventResult;

export const transformDeath: TransformEventFn = (data, _relations) => {
  return {
    ...data,
    payload: {
      ...data.payload,
      location:
        data.payload.location === "" ? undefined : data.payload.location,
    },
  } as TransformEventResult;
};

export const transformUncategorized: TransformEventFn = (data, relations) => {
  const { keywords, groups, actors } = eventRelationIdsMonoid.concat(
    {
      groups: data.payload.groups ?? [],
      actors: data.payload.actors ?? [],
      media: data.media ?? [],
      keywords: data.keywords ?? [],
      areas: data.payload.location ? [data.payload.location] : [],
      groupsMembers: [],
      links: data.links,
    },
    { ...relations, areas: [], groupsMembers: [] },
  );

  return {
    ...data,
    keywords,
    body: Array.isArray(data.body) && data.body.length > 0 ? data.body : null,
    payload: {
      ...data.payload,
      groups,
      actors,
      location:
        data.payload.location === "" ? undefined : data.payload.location,
      endDate:
        data.payload.endDate?.length > 0 ? data.payload.endDate : undefined,
    },
  } as TransformEventResult;
};

export const transformScientificStudy: TransformEventFn = (data) => {
  return {
    ...data,
    payload: {
      ...data.payload,
      publisher:
        data.payload.publisher === "" ? undefined : data.payload.publisher,
    },
  } as TransformEventResult;
};

export const transformQuote: TransformEventFn = (data) => {
  return {
    ...data,
    payload: {
      ...data.payload,
      quote: isValidValue(data.excerpt)
        ? getTextContents(data.excerpt).concat("\n\n")
        : "",
    },
  } as TransformEventResult;
};

const transformBook: TransformEventFn = (data) => {
  return {
    ...data,
    payload: {
      ...data.payload,
      publisher: data.payload.publisher?.type
        ? data.payload.publisher
        : undefined,
    },
  } as TransformEventResult;
};

const transformByType = (
  data: RaRecord,
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
    const newLinks = transformLinks((data.newLinks ?? []) as FormLinkInput[]);
    const links = (data.links ?? []).concat(newLinks);

    const newMedia = transformMedia((data.newMedia ?? []) as FormMediaEntry[]);
    const media: FormMediaEntry[] = (data.media ?? []).concat(newMedia);

    const { rawMedia, otherMedia } = media.reduce<{
      rawMedia: FormRawMedia[];
      otherMedia: FormMediaEntry[];
    }>(
      (acc, m) => {
        if (isFormRawMedia(m)) {
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
      rawMedia.map((r) =>
        uploadFile(dataProvider)(
          "media",
          id,
          r.location.rawFile,
          r.location.rawFile.type as MediaType,
          options,
        ),
      ),
      A.sequence(TE.ApplicativePar),
      TE.map((urls) =>
        pipe(
          urls,
          A.zip(rawMedia),
          A.map(([location, media]) => ({
            ...media,
            ...location,
            thumbnail: Schema.is(http.Media.ImageType)(location.type)
              ? location.location
              : undefined,
          })),
          (uploaded) => [...uploaded, ...otherMedia],
        ),
      ),
      TE.map((updatedMedia) => {
        return Array.isArray(media)
          ? media.concat(updatedMedia.filter((m) => !media.includes(m)))
          : updatedMedia;
      }),
    );

    const excerpt = isValidValue(data.excerpt) ? data.excerpt : null;
    // an empty editor value (`[]`) is not a valid BlockNoteDocument
    const body = isValidValue(data.body) ? data.body : null;

    const relations = relationsTransformer(excerpt ?? []);

    // ScientificStudy payload.url must be a Link UUID: when the form holds a
    // raw URL, find-or-create the link and use its id.
    const studyUrl: unknown = data.payload?.url;
    const payload =
      data.type === EVENT_TYPES.SCIENTIFIC_STUDY &&
      typeof studyUrl === "string" &&
      !Schema.is(http.Common.UUID)(studyUrl)
        ? {
            ...data.payload,
            url: (
              await dataProvider.create("/links/submit", {
                data: { url: studyUrl },
              })
            ).data.id,
          }
        : data.payload;

    const event = transformByType(
      { ...data, payload, excerpt, body },
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
