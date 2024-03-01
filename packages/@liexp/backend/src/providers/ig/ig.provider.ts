import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import {
  IgApiClient,
  IgLoginTwoFactorRequiredError,
  type MediaRepositoryConfigureResponseRootObject,
  type PostingVideoOptions,
  type AccountRepositoryLoginErrorResponse,
  type AccountRepositoryLoginResponseLogged_in_user,
  type PostingAlbumOptions,
} from "instagram-private-api";

export type OnLoginErrorFn = (
  r: AccountRepositoryLoginErrorResponse,
  error: IgLoginTwoFactorRequiredError,
) => Promise<{ code: string }>;

export interface IGProvider {
  ig: IgApiClient;
  login: (
    onError: OnLoginErrorFn,
  ) => TE.TaskEither<Error, AccountRepositoryLoginResponseLogged_in_user>;
  postPhoto: (
    image: Buffer,
    caption: string,
  ) => TE.TaskEither<Error, MediaRepositoryConfigureResponseRootObject>;
  postVideo: (
    options: PostingVideoOptions,
  ) => TE.TaskEither<Error, MediaRepositoryConfigureResponseRootObject>;
  postAlbum: (options: PostingAlbumOptions) => TE.TaskEither<Error, any>;
}

interface IGProviderOpts {
  logger: Logger;
  credentials: {
    username: string;
    password: string;
  };
}

const toIGError = (e: unknown): Error => {
  // eslint-disable-next-line no-console
  console.error(e);
  return e as Error;
};

const liftTE = <A>(p: () => Promise<A>): TE.TaskEither<Error, A> => {
  return TE.tryCatch(p, toIGError);
};

export const IGProvider = (opts: IGProviderOpts): IGProvider => {
  const ig = new IgApiClient();

  let loggedInUser: AccountRepositoryLoginResponseLogged_in_user;
  ig.state.generateDevice(opts.credentials.username);

  const login = (
    onError: OnLoginErrorFn,
  ): TE.TaskEither<Error, AccountRepositoryLoginResponseLogged_in_user> => {
    return liftTE(async () => {
      if (loggedInUser) {
        return loggedInUser;
      }
      opts.logger.debug.log("Simulate pre login flow");
      // await ig.qe.syncLoginExperiments();
      // Execute all requests prior to authorization in the real Android application
      // Not required but recommended

      // await ig.simulate.preLoginFlow();

      opts.logger.debug.log("Login user %s", opts.credentials.username);
      loggedInUser = await ig.account
        .login(opts.credentials.username, opts.credentials.password)
        .catch(async (err) => {
          if (err instanceof IgLoginTwoFactorRequiredError) {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { username, totp_two_factor_on, two_factor_identifier } =
              err.response.body.two_factor_info;
            // decide which method to use
            const verificationMethod = totp_two_factor_on ? "0" : "1"; // default to 1 for SMS
            // At this point a code should have been sent
            // Get the code
            const { code } = await onError(err.response.body, err);
            // Use the code to finish the login process
            return ig.account.twoFactorLogin({
              username,
              verificationCode: code,
              twoFactorIdentifier: two_factor_identifier,
              verificationMethod, // '1' = SMS (default), '0' = TOTP (google auth for example)
              trustThisDevice: "1", // Can be omitted as '1' is used by default
            });
          }

          throw err;
        });
      // The same as preLoginFlow()
      // Optionally wrap it to process.nextTick so we dont need to wait ending of this bunch of requests
      // process.nextTick(async () => {
      //   await ig.simulate.postLoginFlow();
      // });
      opts.logger.debug.log("Logged user %o", loggedInUser);
      // Create UserFeed instance to get loggedInUser's posts
      return loggedInUser;
    });
  };

  return {
    ig,
    login,
    postPhoto: (image, caption) => {
      return liftTE(() =>
        ig.publish.photo({
          file: image,
          caption,
        }),
      );
    },
    postVideo: (options) => {
      return liftTE(() => ig.publish.video(options));
    },
    postAlbum: (options) => {
      return liftTE(() => ig.publish.album(options));
    },
  };
};
