import Avatars from "@dicebear/avatars";
import avataaarsSprites from "@dicebear/avatars-avataaars-sprites";
import botttsSprites from "@dicebear/avatars-bottts-sprites";
import * as IOE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { SpaceClient, toError } from "@providers/space/SpaceClient";

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
          })
        ),
        TE.map((data) => data.Location)
      );
    },
  };
};
