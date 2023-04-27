import * as http from "@liexp/shared/lib/io/http";
import { DEATH } from "@liexp/shared/lib/io/http/Events/Death";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/Quote";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/Uncategorized";
import { getTextContents } from "@liexp/shared/lib/slate";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as A from "fp-ts/Array";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type DataProvider, type RaRecord } from "react-admin";
import { type RawMedia, uploadFile } from "../../client/admin/MediaAPI";

export const transformLinks = (links: any[]): any[] => {
  return links.reduce<Array<string | { url: string; publishDate: Date }>>(
    (acc, l) => {
      if (l.fromURL) {
        return acc.concat({
          url: l.url,
          publishDate: l.publishDate ?? new Date(),
        });
      }
      return acc.concat(l.ids);
    },
    []
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
  data: any
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
  data: any
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
  data: any
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
  data: any
): http.Events.Quote.CreateQuoteBody & { id: http.Common.UUID } => {
  return {
    ...data,
    payload: {
      ...data.payload,
      quote: getTextContents(data.excerpt).join("\n\n"),
    },
  };
};

export const transformEvent =
  (dataProvider: DataProvider<any>) =>
  async (id: string, data: RaRecord): Promise<RaRecord> => {
    const newLinks = transformLinks(data.newLinks ?? []);
    const links = (data.links ?? []).concat(newLinks);

    const newMedia = transformMedia(data.newMedia ?? []);
    const media: any[] = (data.media ?? [])
      .concat(newMedia)
      .concat(...(data.newMediaRef ?? []));

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
      }
    );

    // console.log({ rawMedia, otherMedia });

    const mediaTask = pipe(
      rawMedia.map((r: RawMedia) =>
        uploadFile(dataProvider)(
          "media",
          id,
          r.location.rawFile,
          r.location.rawFile.type as any
        )
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
          A.concat(otherMedia)
        )
      ),
      TE.map((media) =>
        Array.isArray(data.media) ? data.media.concat(media) : media
      )
    );

    const event =
      data.type === UNCATEGORIZED.value
        ? transformUncategorized(data)
        : data.type === DEATH.value
        ? transformDeath(data)
        : data.type === SCIENTIFIC_STUDY.value
        ? transformScientificStudy(data)
        : data.type === QUOTE.value
        ? transformQuote(data)
        : data;

    // eslint-disable-next-line @typescript-eslint/return-await
    return pipe(
      mediaTask,
      TE.map((media) => ({
        ...event,
        media,
        links,
      })),
      throwTE
    );
  };
