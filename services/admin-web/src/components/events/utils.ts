import { Media } from "@liexp/shared/io/http";
import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Record } from "ra-core";
import { dataProvider } from "@client/HTTPAPI";
import { RawMedia, uploadFile } from "@client/MediaAPI";

export const transformEvent = async (
  id: string,
  data: Record
): Promise<Record> => {
  const newLinks = (data.newLinks ?? []).reduce((acc, l) => {
    if (l.fromURL) {
      return acc.concat({ url: l.url, publishDate: l.publishDate });
    }
    return acc.concat(l.ids);
  }, [] as string[]);

  const links = (data.links ?? []).concat(newLinks);

  const media: any[] = (data.newMedia ?? ([] as any[])).reduce((acc, m) => {
    if (Array.isArray(m.ids)) {
      return acc.concat(m.ids);
    }

    if (m.fromURL) {
      return acc.concat({
        ...m,
        thumbnail: m.location,
      });
    }
    return acc.concat(m);
  }, []);

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
    A.sequence(TE.ApplicativePar)(
      rawMedia.map((r: any) =>
        uploadFile(dataProvider)(
          "media",
          id,
          r.location.rawFile,
          r.location.rawFile.type
        )
      )
    ),
    TE.map((urls) =>
      pipe(
        urls,
        A.zip(rawMedia),
        A.map(([location, media]) => ({
          ...media,
          ...location,
          thumbnail: Media.ImageType.is(location.type)
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

  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    mediaTask,
    TE.map((media) => ({
      ...data,
      media,
      links,
      endDate: data.endDate?.length > 0 ? data.endDate : undefined,
    }))
  )().then((result) => {
    if (result._tag === "Left") {
      return Promise.reject(result.left);
    }
    return result.right;
  });
};
