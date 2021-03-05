import * as io from "@econnessione/shared/io";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import * as orm from "@providers/orm";
import { ArticleEntity } from "@entities/Article.entity";
import { EventEntity } from "@entities/Event.entity";
import { ImageEntity } from "@entities/Image.entity";
import { LinkEntity } from "@entities/Link.entity";
import { GroupEntity } from "@entities/Group.entity";
import { PageEntity } from "@entities/page.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { uuid } from "@econnessione/shared/utils/uuid";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as IO from "fp-ts/lib/IO";
import * as IOE from "fp-ts/lib/IOEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import * as fs from "fs";
import grayMatter from "gray-matter";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as path from "path";

const staticToLocation = (staticPath: string): string =>
  "http://localhost:4010/" + staticPath.replace("../../static/", "");

const toActor = (data: any): any => {
  return {
    ...data,
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    avatar: data.avatar ? staticToLocation(data.avatar) : undefined,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
};

const toGroup = (data: any): any => {
  return {
    ...data,
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    avatar: staticToLocation(data.avatar),
    members: data.members.map((actorId: string) => {
      const m = new GroupMemberEntity();
      const actor = new ActorEntity();
      actor.id = actorId;
      m.actor = actor;
      return m;
    }),
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
};

const toPage = (data: any): any => {
  return {
    ...data,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
};

const toArticle = (data: any): any => {
  // console.log('article', data)
  return {
    ...data,
    featuredImage: staticToLocation(data.featuredImage),
    links: data.links ?? [],
    createdAt: data.createdAt ? data.createdAt.toISOString() : undefined,
    updatedAt: data.updatedAt ? data.updatedAt.toISOString() : undefined,
  };
};

const toProject = (data: any): any => {
  return {
    ...data,
    areas: [JSON.parse(data.areas)],
    images: data.images
      ? data.images.map((imageSrc: string) => {
          const image = new ImageEntity();
          image.location = staticToLocation(imageSrc);
          return image;
        })
      : [],
    startDate: data.startDate ? data.startDate.toISOString() : undefined,
    endDate: data.endDate ? data.endDate.toISOString() : undefined,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
};

const allLinks: Record<string, string> = {};

const toEvent = (data: any): any => {
  return {
    ...data,
    location: data.location ? JSON.parse(data.location) : undefined,
    actors: data.actors
      ? data.actors.map((a: any) => {
          const actor = new ActorEntity();
          actor.id = a;
          return actor;
        })
      : [],
    groups: data.groups
      ? data.groups.map((g: any) => {
          const group = new GroupEntity();
          group.id = g;
          return group;
        })
      : [],
    links: data.links
      ? data.links.map((l: string) => {
          const savedLink = Object.entries(allLinks).find(
            ([_id, url]) => url === l
          );
          if (savedLink) {
            return { id: savedLink[0] };
          }

          const link = new LinkEntity();
          link.id = uuid();
          link.description = l;
          link.url = l;
          allLinks[link.id] = link.url;
          return link;
        })
      : [],
    images: data.images
      ? data.images.map((l: any) => {
          const img = new ImageEntity();
          img.id = uuid();
          img.location = staticToLocation(l.image);
          img.description = l.description;
          return img;
        })
      : [],
    startDate: data.startDate
      ? data.startDate.toISOString()
      : data.date
      ? data.date.toISOString()
      : new Date().toISOString(),
    endDate: data.endDate ? data.endDate.toISOString() : undefined,
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
};

const readDir = (dir: string): IO.IO<string[]> =>
  IO.of(fs.readdirSync(dir, { encoding: "utf-8" }));

const parseFile = (
  filePath: string,
  codec: any,
  mapper: (data: any) => any
): IOE.IOEither<ControllerError, any> =>
  pipe(
    IO.of(grayMatter.read(filePath)),
    IOE.fromIO,
    IOE.chain((file) => {
      const { uuid: id, ...data } = file.data;
      return pipe(
        codec.decode(
          mapper({
            ...data,
            id,
            body: file.content,
          })
        ),
        E.mapLeft(DecodeError),
        IOE.fromEither
      );
    })
  );

const saveFromDir = (
  db: orm.DatabaseClient,
  dir: string,
  entity: any,
  codec: any,
  mapper: (data: any) => any
): TE.TaskEither<any, io.http.Page.Page[]> => {
  const dirToRead = path.join(process.cwd(), "content", dir);
  console.log(`Reading ${dirToRead}`);
  return pipe(
    readDir(dirToRead),
    IO.map(A.filter((f) => f.indexOf(".md") > 0)),
    TE.fromIO,
    TE.chain((files) => {
      console.log("Files ", files);
      return pipe(
        files,
        A.traverse(IOE.ioEither)((name) =>
          parseFile(path.join(dirToRead, name), codec, mapper)
        ),
        TE.fromIOEither
      );
    }),
    TE.chain((files) => {
      return db.save(entity, files);
    })
  );
};

const run = (): Promise<void> => {
  return pipe(
    ENV.decode(process.env),
    E.mapLeft(DecodeError),
    TE.fromEither,
    TE.chain((env) =>
      orm.GetTypeORMClient({
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
          EventEntity,
          ImageEntity,
          LinkEntity,
        ],
        synchronize: true,
        ssl:
          env.DB_SSL_MODE === "require"
            ? {
                ca: fs.readFileSync(
                  path.join(__dirname, "../certs/dev-certificate.crt"),
                  {
                    encoding: "utf-8",
                  }
                ),
              }
            : false,
      })
    ),
    TE.chain((db) => {
      return pipe(
        [
          ["articles", ArticleEntity, io.http.Article.Article, toArticle],
          ["pages", PageEntity, io.http.Page.Page, toPage],
          ["actors", ActorEntity, io.http.Actor.Actor, toActor],
          ["groups", GroupEntity, t.any, toGroup],
          ["projects", ProjectEntity, io.http.Project.Project, toProject],
          ["events/uncategorized", EventEntity, t.any, toEvent],
        ],
        A.traverse(
          TE.taskEitherSeq
        )(
          ([dir, entity, codec, mapper]: [
            string,
            any,
            any,
            (data: any) => any
          ]) => saveFromDir(db, dir, entity, codec, mapper)
        )
      );
    })
  )().then((result) => {
    if (E.isLeft(result)) {
      if (result.left.name === "APIError") {
        console.error(PathReporter.report(E.left(result.left.details.errors)));
        return;
      }
      console.error(result.left);
      return;
    }
    console.log("Completed!");
  });
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
