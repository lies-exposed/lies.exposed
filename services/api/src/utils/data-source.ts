import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm";
import { ActorEntity } from "@entities/Actor.entity";
import { AreaEntity } from "@entities/Area.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { PageEntity } from "@entities/Page.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { StoryEntity } from "@entities/Story.entity";
import { UserEntity } from "@entities/User.entity";
import { DeathEventEntity } from "@entities/archive/DeathEvent.entity";
import { EventEntity } from "@entities/archive/Event.entity";
import { MediaV1Entity } from "@entities/archive/Media.v1.entity";
import { ScientificStudyEntity } from "@entities/archive/ScientificStudy.entity";
import { type ENV } from "@io/ENV";

export const getDataSource = (
  env: ENV,
  includeOldEntities: boolean
): DataSource => {
  const ssl =
    env.DB_SSL_MODE === "require"
      ? {
          ca: fs.readFileSync(path.join(process.cwd(), env.DB_SSL_CERT_PATH), {
            encoding: "utf-8",
          }),
        }
      : false;

  return new DataSource({
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
    ],
    synchronize: env.NODE_ENV === "test",
    ssl,
    migrations:
      env.NODE_ENV === "test"
        ? undefined
        : [`${process.cwd()}/build/migrations/*.js`],
  });
};
