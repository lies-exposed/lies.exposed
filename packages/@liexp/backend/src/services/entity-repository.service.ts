import { type Option } from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type DeepPartial,
  type EntityTarget,
  type FindOneOptions,
  type ObjectLiteral,
} from "typeorm";
import { type DatabaseContext } from "../context/db.context.js";
import { ActorEntity } from "../entities/Actor.entity.js";
import { AreaEntity } from "../entities/Area.entity.js";
import { EventV2Entity } from "../entities/Event.v2.entity.js";
import { GroupEntity } from "../entities/Group.entity.js";
import { KeywordEntity } from "../entities/Keyword.entity.js";
import { LinkEntity } from "../entities/Link.entity.js";
import { MediaEntity } from "../entities/Media.entity.js";
import { StoryEntity } from "../entities/Story.entity.js";
import { UserEntity } from "../entities/User.entity.js";
import { type DBError } from "../providers/orm/database.provider.js";

export interface EntityRepository<E extends ObjectLiteral> {
  findOne: <C extends DatabaseContext>(
    opts: FindOneOptions<E>,
  ) => ReaderTaskEither<C, DBError, Option<E>>;
  findOneOrFail: <C extends DatabaseContext>(
    opts: FindOneOptions<E>,
  ) => ReaderTaskEither<C, DBError, E>;
  save: <C extends DatabaseContext>(
    entities: DeepPartial<E>[],
  ) => ReaderTaskEither<C, DBError, E[]>;
}

const EntityRepository = <E extends ObjectLiteral>(
  e: EntityTarget<E>,
): EntityRepository<E> => ({
  findOne:
    <C extends DatabaseContext>(
      opts: FindOneOptions<E>,
    ): ReaderTaskEither<C, DBError, Option<E>> =>
    (ctx) =>
      ctx.db.findOne(e, opts),
  findOneOrFail:
    <C extends DatabaseContext>(
      opts: FindOneOptions<E>,
    ): ReaderTaskEither<C, DBError, E> =>
    (ctx) =>
      pipe(ctx.db.findOneOrFail(e, opts)),
  save:
    <C extends DatabaseContext>(
      entities: DeepPartial<E>[],
    ): ReaderTaskEither<C, DBError, E[]> =>
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
export const KeywordRepository = EntityRepository(KeywordEntity);
export const UserRepository = EntityRepository(UserEntity);
