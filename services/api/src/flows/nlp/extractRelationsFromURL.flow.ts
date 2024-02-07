import path from "path";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetEncodeUtils } from "@liexp/shared/lib/utils/encode.utils.js";
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
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const extractRelationsFromURL: TEFlow<
  [puppeteer.Page, string],
  {
    entities: {
      actors: ActorEntity[];
      groups: GroupEntity[];
      keywords: KeywordEntity[];
      links: LinkEntity[];
      areas: AreaEntity[];
      groupsMembers: GroupMemberEntity[];
      media: MediaEntity[];
    };
    sentences: Array<{ text: string; importance: number }>;
  }
> = (ctx) => (p, url) => {
  const id = GetEncodeUtils<string>((url) => ({ url })).hash(url);
  const filePath = path.resolve(ctx.config.dirs.temp.root, `urls/${id}.txt`);

  return pipe(
    ctx.fs.getOlderThanOr(filePath)(
      pipe(
        TE.tryCatch(async () => {
          await p.goto(url, {
            waitUntil: "networkidle0",
          });
          return await p.$eval("body", (b) => b.innerText);
        }, toControllerError),
      ),
    ),
    TE.chain(extractRelationsFromText(ctx)),
  );
};
