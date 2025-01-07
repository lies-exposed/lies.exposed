import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { type ConfigContext } from "../../../context/config.context.js";
import { type DatabaseContext } from "../../../context/db.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type NERProviderContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type ActorEntity } from "../../../entities/Actor.entity.js";
import { type AreaEntity } from "../../../entities/Area.entity.js";
import { type GroupEntity } from "../../../entities/Group.entity.js";
import { type GroupMemberEntity } from "../../../entities/GroupMember.entity.js";
import { type KeywordEntity } from "../../../entities/Keyword.entity.js";
import { type LinkEntity } from "../../../entities/Link.entity.js";
import { type MediaEntity } from "../../../entities/Media.entity.js";
import { ServerError } from "../../../errors/ServerError.js";
import { getOlderThanOr } from "../../../flows/fs/getOlderThanOr.flow.js";
import { GetEncodeUtils } from "../../../utils/encode.utils.js";
import { extractRelationsFromText } from "./extractRelationsFromText.flow.js";

export const extractRelationsFromURL = <
  C extends ConfigContext &
    FSClientContext &
    LoggerContext &
    NERProviderContext &
    DatabaseContext,
>(
  p: puppeteer.Page,
  url: string,
): ReaderTaskEither<
  C,
  ServerError,
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
    sentences: { text: string; importance: number }[];
  }
> => {
  const id = GetEncodeUtils<string>((url) => ({ url })).hash(url);

  return pipe(
    fp.RTE.ask<C>(),
    fp.RTE.map((ctx) =>
      path.resolve(ctx.config.dirs.temp.root, `urls/${id}.txt`),
    ),
    fp.RTE.chain((filePath) =>
      getOlderThanOr(filePath)<string, ServerError, C>(
        pipe(
          TE.tryCatch(async () => {
            await p.goto(url, {
              waitUntil: "domcontentloaded",
            });
            return p.$eval("body", (b) => b.innerText);
          }, ServerError.fromUnknown),
          fp.RTE.fromTaskEither,
        ),
      ),
    ),
    fp.RTE.chain((m) => extractRelationsFromText(m)),
  );
};
