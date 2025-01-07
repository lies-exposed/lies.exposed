import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ConfigContext } from "../../../context/config.context.js";
import { type DatabaseContext } from "../../../context/db.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type NERProviderContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
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
import { fetchPDF } from "../../media/fetchPDF.flow.js";
import { extractRelationsFromText } from "./extractRelationsFromText.flow.js";

interface Result {
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

export const extractRelationsFromPDFs = <
  C extends FSClientContext &
    LoggerContext &
    ConfigContext &
    PDFProviderContext &
    HTTPProviderContext &
    NERProviderContext &
    DatabaseContext,
>(
  url: string,
): ReaderTaskEither<C, ServerError, Result> => {
  const id = GetEncodeUtils<string>((url) => ({ url })).hash(url);

  return pipe(
    fp.RTE.ask<C>(),
    fp.RTE.map((ctx) =>
      path.resolve(ctx.config.dirs.temp.root, `media/${id}.txt`),
    ),
    fp.RTE.chain((filePath) =>
      getOlderThanOr(filePath)<string, ServerError, C>(
        pipe(
          fetchPDF(url),
          fp.RTE.chain((pdf) => (ctx) => ctx.pdf.getAllTextContents(pdf)),
          fp.RTE.mapLeft(ServerError.fromUnknown),
        ),
      ),
    ),
    fp.RTE.chain(extractRelationsFromText<C>),
  );
};
