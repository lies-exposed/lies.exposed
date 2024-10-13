import { type DeepPartial } from "typeorm";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const saveMedia =
  (media: DeepPartial<MediaEntity>[]): TEReader<MediaEntity[]> =>
  (ctx) => {
    return ctx.db.save(MediaEntity, media);
  };
