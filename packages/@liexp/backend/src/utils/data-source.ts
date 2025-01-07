// import 'reflect-metadata' as first
import "reflect-metadata";
// other imports
import * as fs from "fs";
import * as path from "path";
import * as TE from "fp-ts/lib/TaskEither.js";
import { DataSource, type DataSourceOptions } from "typeorm";
import { ActorEntity } from "../entities/Actor.entity.js";
import { AreaEntity } from "../entities/Area.entity.js";
import { EventV2Entity } from "../entities/Event.v2.entity.js";
import { EventSuggestionEntity } from "../entities/EventSuggestion.entity.js";
import { GraphEntity } from "../entities/Graph.entity.js";
import { GroupEntity } from "../entities/Group.entity.js";
import { GroupMemberEntity } from "../entities/GroupMember.entity.js";
import { KeywordEntity } from "../entities/Keyword.entity.js";
import { LinkEntity } from "../entities/Link.entity.js";
import { MediaEntity } from "../entities/Media.entity.js";
import { PageEntity } from "../entities/Page.entity.js";
import { ProjectEntity } from "../entities/Project.entity.js";
import { ProjectImageEntity } from "../entities/ProjectImage.entity.js";
import { SettingEntity } from "../entities/Setting.entity.js";
import { SocialPostEntity } from "../entities/SocialPost.entity.js";
import { StoryEntity } from "../entities/Story.entity.js";
import { UserEntity } from "../entities/User.entity.js";
import { DeathEventEntity } from "../entities/archive/DeathEvent.entity.js";
import { EventEntity } from "../entities/archive/Event.entity.js";
import { MediaV1Entity } from "../entities/archive/Media.v1.entity.js";
import { ScientificStudyEntity } from "../entities/archive/ScientificStudy.entity.js";
import { type BACKEND_ENV } from "../io/ENV.js";
import { toDBError, type DBError } from "../providers/orm/database.provider.js";

export const getORMConfig = (
  env: BACKEND_ENV,
  includeOldEntities: boolean,
): DataSourceOptions => {
  const ssl =
    env.DB_SSL_MODE === "require"
      ? {
          ca: fs.readFileSync(path.join(process.cwd(), env.DB_SSL_CERT_PATH), {
            encoding: "utf-8",
          }),
        }
      : false;

  return {
    type: "postgres",
    host: env.DB_HOST,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    port: env.DB_PORT,
    entities: [
      ...(includeOldEntities
        ? [
            // old
            EventEntity,
            DeathEventEntity,
            ScientificStudyEntity,
            MediaV1Entity,
          ]
        : []),

      // current
      PageEntity,
      ActorEntity,
      GroupEntity,
      GroupMemberEntity,
      StoryEntity,
      ProjectEntity,
      ProjectImageEntity,
      AreaEntity,
      EventV2Entity,
      MediaEntity,
      LinkEntity,
      KeywordEntity,
      UserEntity,
      EventSuggestionEntity,
      SocialPostEntity,
      GraphEntity,
      SettingEntity,
    ],
    synchronize: env.NODE_ENV === "test",
    ssl,
  };
};

export const getDataSource = (
  config: DataSourceOptions,
): TE.TaskEither<DBError, DataSource> => {
  return TE.tryCatch(async () => {
    const dataSource = new DataSource(config);
    // if (!dataSource.isInitialized) {
    //   await dataSource.initialize();
    // }
    return Promise.resolve(dataSource);
  }, toDBError());
};
