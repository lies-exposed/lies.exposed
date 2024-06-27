import path from "path";
import { GetEncodeUtils } from "@liexp/backend/lib/utils/encode.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { extractRelationsFromText } from "./extractRelationsFromText.flow.js";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type AreaEntity } from "#entities/Area.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchPDF } from "#flows/media/fetchPDF.flow.js";

export const extractRelationsFromPDFs: TEFlow<
  [string],
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
> = (ctx) => (url) => {
  const id = GetEncodeUtils<string>((url) => ({ url })).hash(url);
  const filePath = path.resolve(ctx.config.dirs.temp.root, `media/${id}.txt`);

  return pipe(
    ctx.fs.getOlderThanOr(filePath)(
      pipe(
        fetchPDF(ctx)(url),
        TE.chain((pdf) => ctx.pdf.getAllTextContents(pdf)),
      ),
    ),
    TE.chain(extractRelationsFromText(ctx)),
  );
};
