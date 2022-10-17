import Avatars from "@dicebear/avatars";
import avataaarsSprites from "@dicebear/avatars-avataaars-sprites";
import botttsSprites from "@dicebear/avatars-bottts-sprites";
import { SpaceClient, toError } from "@liexp/shared/providers/space/SpaceClient";
import * as IOE from "fp-ts/IOEither";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

const options = {
  r: 50,
};

export interface AvatarsFixture {
  saveAvatar: (resource: string, id: string) => TE.TaskEither<Error, string>;
  saveBotAvatar: (resource: string, id: string) => TE.TaskEither<Error, string>;
}

interface AvatarsFixtureOpts {
  client: SpaceClient;
}
export const AvatarsFixture = ({
  client,
}: AvatarsFixtureOpts): AvatarsFixture => {
  const botAvatars = new Avatars(botttsSprites, options);
  const avataaars = new Avatars(avataaarsSprites, options);

  return {
    saveAvatar: (resource: string, id: string) => {
      const avatarName = `${resource}-${id}`;
      return pipe(
        IOE.tryCatch(() => {
          return avataaars.create(avatarName);
        }, toError),
        TE.fromIOEither,
        TE.chain((content) =>
          client.upload({
            Key: `public/media/${resource}/${id}/${id}.svg`,
            Body: content,
            Bucket: "localhost:3010",
            ACL: 'public-read'
          })
        ),
        TE.map((data) => data.Location)
      );
    },
    saveBotAvatar: (resource: string, id: string) => {
      const avatarName = `${resource}-${id}`;
      return pipe(
        IOE.tryCatch(() => {
          return botAvatars.create(avatarName);
        }, toError),
        TE.fromIOEither,
        TE.chain((content) =>
          client.upload({
            Key: `public/media/${resource}/${id}/${id}.svg`,
            Body: content,
            Bucket: "localhost:3010",
            ACL: 'public-read'
          })
        ),
        TE.map((data) => data.Location)
      );
    },
  };
};
