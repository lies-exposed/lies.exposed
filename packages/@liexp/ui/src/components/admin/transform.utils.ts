import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type RaRecord } from "react-admin";
import { uploadFile, type RawMedia } from "../../client/admin/MediaAPI.js";
import { getTextContents } from "../Common/BlockNote/utils/getTextContents.js";
import { isValidValue } from "../Common/BlockNote/utils/isValidValue.js";

export const transformLinks = (links: any[]): any[] => {
  return links.reduce<(string | { url: string; publishDate: Date })[]>(
    (acc, l) => {
      if (l.fromURL) {
        return acc.concat({
          url: l.url,
          publishDate: l.publishDate ?? new Date(),
        });
      }
      return acc.concat(l.ids);
    },
    [],
  );
};

export const transformMedia = (newMedia: any[]): any[] => {
  return newMedia.reduce((acc, m) => {
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

export const transformDeath = (
  data: any,
): http.Events.CreateEventBody & { id: http.Common.UUID } => {
  return {
    ...data,
    payload: {
      ...data.payload,
      location:
        data.payload.location === "" ? undefined : data.payload.location,
    },
  };
};

export const transformUncategorized = (
  data: any,
): http.Events.CreateEventBody & { id: http.Common.UUID } => {
  return {
    ...data,
    payload: {
      ...data.payload,
      location:
        data.payload.location === "" ? undefined : data.payload.location,
      endDate:
        data.payload.endDate?.length > 0 ? data.payload.endDate : undefined,
    },
  };
};

export const transformScientificStudy = (
  data: any,
): http.Events.CreateEventBody & { id: http.Common.UUID } => {
  return {
    ...data,
    payload: {
      ...data.payload,
      publisher:
        data.payload.publisher === "" ? undefined : data.payload.publisher,
    },
  };
};

export const transformQuote = (
  data: any,
): http.Events.Quote.CreateQuoteBody & { id: http.Common.UUID } => {
  return {
    ...data,
    payload: {
      ...data.payload,
      quote: isValidValue(data.excerpt)
        ? getTextContents(data.excerpt).concat("\n\n")
        : "",
    },
  };
};

const transformBook = (
  data: any,
): http.Events.Book.CreateBookBody & { id: http.Common.UUID } => {
  return {
    ...data,
    payload: {
      ...data.payload,
      publisher: data.payload.publisher?.type
        ? data.payload.publisher
        : undefined,
    },
  };
};

export const transformEvent =
  (dataProvider: APIRESTClient) =>
  async (id: string, data: RaRecord): Promise<RaRecord> => {
    // console.log("transform event", { ...data, id });
    const newLinks = transformLinks(data.newLinks ?? []);
    const links = (data.links ?? []).concat(newLinks);

    const newMedia = transformMedia(data.newMedia ?? []);
    const media: any[] = (data.media ?? []).concat(newMedia);

    const { rawMedia, otherMedia } = media.reduce<{
      rawMedia: RawMedia[];
      otherMedia: any[];
    }>(
      (acc, m) => {
        if (m.location?.rawFile !== undefined) {
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

    // console.log({ rawMedia, otherMedia });

    const mediaTask = pipe(
      rawMedia.map((r: RawMedia) =>
        uploadFile(dataProvider)(
          "media",
          id,
          r.location.rawFile,
          r.location.rawFile.type as any,
        ),
      ),
      A.sequence(TE.ApplicativePar),
      TE.map((urls) =>
        pipe(
          urls,
          A.zip(rawMedia),
          A.map(([location, media]: [any, any]) => ({
            ...media,
            ...location,
            thumbnail: http.Media.ImageType.is(location.type)
              ? location.location
              : undefined,
          })),
          A.concat(otherMedia),
        ),
      ),
      TE.map((updatedMedia) => {
        return Array.isArray(media)
          ? media.concat(updatedMedia.filter((m) => !media.includes(m)))
          : updatedMedia;
      }),
    );

    const event =
      data.type === EventTypes.UNCATEGORIZED.value
        ? transformUncategorized(data)
        : data.type === EventTypes.DEATH.value
          ? transformDeath(data)
          : data.type === EventTypes.SCIENTIFIC_STUDY.value
            ? transformScientificStudy(data)
            : data.type === EventTypes.QUOTE.value
              ? transformQuote(data)
              : data.type === EventTypes.BOOK.value
                ? transformBook(data)
                : data;

    // eslint-disable-next-line @typescript-eslint/return-await
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
