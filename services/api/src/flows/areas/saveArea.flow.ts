import { type DeepPartial } from "typeorm";
import { AreaEntity } from "#entities/Area.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const saveArea =
  (data: DeepPartial<AreaEntity>[]): TEReader<AreaEntity[]> =>
  (ctx) => {
    return ctx.db.save(AreaEntity, data);
  };
