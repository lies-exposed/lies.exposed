import { type DatabaseContext } from "@liexp/backend/lib/context/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type DeepPartial,
  type EntityTarget,
  type FindOneOptions,
  type ObjectLiteral,
} from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { StoryEntity } from "#entities/Story.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export interface EntityRepository<E extends ObjectLiteral> {
  findOne: <C extends DatabaseContext>(
    opts: FindOneOptions<E>,
  ) => TEReader<Option<E>, C>;
  findOneOrFail: <C extends DatabaseContext>(
    opts: FindOneOptions<E>,
  ) => TEReader<E, C>;
  save: <C extends DatabaseContext>(
    entities: DeepPartial<E>[],
  ) => TEReader<E[], C>;
}

const EntityRepository = <E extends ObjectLiteral>(
  e: EntityTarget<E>,
): EntityRepository<E> => ({
  findOne:
    <C extends DatabaseContext = DatabaseContext>(
      opts: FindOneOptions<E>,
    ): TEReader<Option<E>, C> =>
    (ctx) =>
      ctx.db.findOne(e, opts),
  findOneOrFail:
    <C extends DatabaseContext = DatabaseContext>(
      opts: FindOneOptions<E>,
    ): TEReader<E, C> =>
    (ctx) =>
      pipe(ctx.db.findOneOrFail(e, opts)),
  save:
    <C extends DatabaseContext = DatabaseContext>(
      entities: DeepPartial<E>[],
    ): TEReader<E[], C> =>
    (ctx) =>
      pipe(ctx.db.save(e, entities)),
});

export const ActorRepository = EntityRepository(ActorEntity);
export const AreaRepository = EntityRepository(AreaEntity);
export const GroupRepository = EntityRepository(GroupEntity);
export const MediaRepository = EntityRepository(MediaEntity);
export const LinkRepository = EntityRepository(LinkEntity);
export const StoryRepository = EntityRepository(StoryEntity);
export const EventRepository = EntityRepository(EventV2Entity);
