import { fp } from "@liexp/core/lib/fp";
import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import snakeCase from "lodash/snakeCase";
import { type TEFlow } from "@flows/flow.types";
import { fetchFromWikipedia } from "@flows/wikipedia/fetchFromWikipedia";

export const fetchActorFromWikipedia: TEFlow<[string], AddActorBody> =
  (ctx) => (search) => {
    return pipe(
      fetchFromWikipedia(ctx)(search),
      TE.map(({ page, avatar, intro }) => {
        const username = pipe(
          page.fullurl.split("/"),
          fp.A.last,
          fp.O.map((n) => snakeCase(n.replaceAll("_", " "))),
          fp.O.getOrElse(() => snakeCase(search))
        );

        // const avatar = pipe(
        //   p.media.filter((i) => i.type === "image"),
        //   fp.A.head,
        //   fp.O.chainNullableK((r) => r.srcset?.[0]?.src),
        //   fp.O.map((url) => `https:${url}`),
        //   fp.O.toUndefined
        // );

        const excerpt = createExcerptValue(intro);
        return {
          fullName: page.title,
          username,
          avatar,
          excerpt,
          color: generateRandomColor(),
          body: {},
        };
      })
    );
  };
