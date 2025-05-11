import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { PngType } from "@liexp/shared/lib/io/http/Media/index.js";
import {
  contentTypeFromFileExt,
  getMediaThumbKey,
} from "@liexp/shared/lib/utils/media.utils.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type LinkEntity } from "../../entities/Link.entity.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";
import { type SpaceError } from "../../providers/space/space.provider.js";
import { upload } from "../space/upload.flow.js";
import { takeURLScreenshot } from "../url/takeURLScreenshot.flow.js";

const uploadScreenshot = <C extends SpaceContext & ENVContext>(
  link: LinkEntity & { image: MediaEntity | null },
  buffer: Buffer,
): ReaderTaskEither<C, SpaceError, MediaEntity> => {
  const id = link.image?.id ?? link.id;
  const mediaKey = getMediaThumbKey(id, PngType.literals[0]);
  return pipe(
    upload({
      Key: mediaKey,
      Body: buffer,
      ContentType: PngType.literals[0],
      ACL: "public-read",
    }),
    fp.RTE.map((upload) => ({
      ...(link.image ?? {}),
      id,
      creator: link.image?.creator ?? null,
      label: link.image?.label ?? link.title,
      description: link.image?.description ?? link.description,
      extra: link.image?.extra ?? null,
      featuredInAreas: [],
      featuredInStories: [],
      stories: [],
      events: [],
      keywords: [],
      links: [],
      areas: [],
      type: PngType.literals[0],
      location: upload.Location as URL,
      thumbnail: upload.Location as URL,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })),
  );
};

export const takeLinkScreenshot = <
  C extends DatabaseContext &
    PuppeteerProviderContext &
    SpaceContext &
    ENVContext,
>(
  link: Omit<LinkEntity, "image"> & { image: MediaEntity | null },
): ReaderTaskEither<C, DBError, LinkEntity> =>
  pipe(
    takeURLScreenshot(link.url)<C>,
    fp.RTE.chain((buffer) => uploadScreenshot(link, buffer)),
    fp.RTE.map((screenshot) => ({
      ...link,
      image: screenshot.location
        ? {
            ...link.image,
            ...screenshot,
            id: screenshot.id,
            location: screenshot.location,
            thumbnail:
              screenshot.thumbnail ??
              link.image?.thumbnail ??
              screenshot.location,
            extra: screenshot.extra ?? link.image?.extra ?? null,
            type:
              screenshot.type ??
              (link.image?.location
                ? contentTypeFromFileExt(link.image?.location)
                : PngType.literals[0]),
            label: link.title,
            description: link.description,
          }
        : link.image,
    })),
  );
