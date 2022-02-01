import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { ActorEntity } from "@entities/Actor.entity";
import { AreaEntity } from "@entities/Area.entity";
import { ArticleEntity } from "@entities/Article.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { PageEntity } from "@entities/Page.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { UserEntity } from "@entities/User.entity";
import { ENV } from "@io/ENV";
import { DatabaseConnectionOpts } from "@providers/orm";
import { EventEntity } from "@entities/archive/Event.entity";
import { DeathEventEntity } from "@entities/archive/DeathEvent.entity";
import { ScientificStudyEntity } from '@entities/archive/ScientificStudy.entity';

export const getDBOptions = (env: ENV): DatabaseConnectionOpts => {
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
      PageEntity,
      ActorEntity,
      GroupEntity,
      GroupMemberEntity,
      ArticleEntity,
      ProjectEntity,
      ProjectImageEntity,
      AreaEntity,
      EventV2Entity,
      MediaEntity,
      LinkEntity,
      KeywordEntity,
      UserEntity,
      // old
      EventEntity,
      DeathEventEntity,
      ScientificStudyEntity
    ],
    synchronize: env.NODE_ENV === "test",
    ssl: ssl,
    migrations: [`${process.cwd()}/build/migrations/*.js`],
    cli: {
      migrationsDir: "src/migrations",
    },
  };
};
