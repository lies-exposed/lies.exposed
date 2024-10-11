import path from "path";
import { GetEncodeUtils } from "@liexp/backend/lib/utils/encode.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { extractRelationsFromText } from "./extractRelationsFromText.flow.js";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type AreaEntity } from "#entities/Area.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { getOlderThanOr } from "#flows/fs/getOlderThanOr.flow.js";
import { toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export const extractRelationsFromURL = (
  p: puppeteer.Page,
  url: string,
): TEReader<{
  entities: {
    actors: ActorEntity[];
    groups: GroupEntity[];
    keywords: KeywordEntity[];
    links: LinkEntity[];
    areas: AreaEntity[];
    groupsMembers: GroupMemberEntity[];
    media: MediaEntity[];
  };
  sentences: { text: string; importance: number }[];
}> => {
  const id = GetEncodeUtils<string>((url) => ({ url })).hash(url);

  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.map((ctx) =>
      path.resolve(ctx.config.dirs.temp.root, `urls/${id}.txt`),
    ),
    fp.RTE.chain((filePath) =>
      getOlderThanOr(filePath)(
        pipe(
          TE.tryCatch(async () => {
            await p.goto(url, {
              waitUntil: "domcontentloaded",
            });
            return p.$eval("body", (b) => b.innerText);
          }, toControllerError),
          fp.RTE.fromTaskEither,
        ),
      ),
    ),
    fp.RTE.chain((m) => extractRelationsFromText(m)),
  );
};
