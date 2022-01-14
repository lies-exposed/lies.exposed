import { Media } from "@econnessione/shared/io/http";
import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Record } from "ra-core";
import { dataProvider } from "@client/HTTPAPI";
import { RawMedia, uploadFile } from "@client/MediaAPI";

export const transformEvent = async (
  id: string,
  data: Record
): Promise<Record> => {
  const media: any[] = (data.media as any[]).reduce((acc, l) => {
    if (Array.isArray(l.ids)) {
      return acc.concat(l.ids);
    }

    if (l.fromURL) {
      return acc.concat({
        ...l,
        thumbnail: l.location,
      });
    }
    return acc.concat(l);
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
    )
  );
  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    mediaTask,
    TE.map((media) => ({
      ...data,
      media,
      endDate: data.endDate?.length > 0 ? data.endDate : undefined,
    }))
  )().then((result) => {
    if (result._tag === "Left") {
      return Promise.reject(result.left);
    }
    return result.right;
  });
};
