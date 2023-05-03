import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type TEFlow } from "@flows/flow.types";
import { fetchFromWikipedia } from "@flows/wikipedia/fetchFromWikipedia";

export const fetchGroupFromWikipedia: TEFlow<[string], CreateGroupBody> =
  (ctx) => (url) => {
    return pipe(
      fetchFromWikipedia(ctx)(url),
      TE.map(({ page, avatar, intro }) => {
        const group = {
          name: page.title,
          kind: "Public" as const,
          startDate: new Date(),
          endDate: undefined,
          members: [],
          excerpt: createExcerptValue(intro),
          avatar: avatar as any,
          color: generateRandomColor(),
          body: {},
        };

        return group;
      })
    );
  };
