import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
import { fetchPDF } from "@liexp/backend/lib/flows/media/fetchPDF.flow.js";
import { GetEncodeUtils } from "@liexp/backend/lib/utils/encode.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { extractRelationsFromText } from "./extractRelationsFromText.flow.js";
import { type ServerContext } from "#context/context.type.js";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type AreaEntity } from "#entities/Area.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";

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

export const extractRelationsFromPDFs = (url: string): TEReader<Result> => {
  const id = GetEncodeUtils<string>((url) => ({ url })).hash(url);

  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.map((ctx) =>
      path.resolve(ctx.config.dirs.temp.root, `media/${id}.txt`),
    ),
    fp.RTE.chain((filePath) =>
      getOlderThanOr(filePath)<string, ControllerError, ServerContext>(
        pipe(
          fetchPDF(url),
          fp.RTE.chain((pdf) => (ctx) => ctx.pdf.getAllTextContents(pdf)),
        ),
      ),
    ),
    fp.RTE.chain(extractRelationsFromText),
  );
};
