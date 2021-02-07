import { http } from "@econnessione/core";
import axios from "axios";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { AuthProvider, CreateResult } from "react-admin";

const publicDataProvider = http.APIRESTClient({
  url: process.env.REACT_APP_API_URL,
});

const dataProvider = http.APIRESTClient({
  url: process.env.REACT_APP_API_URL,
  getAuth: () => {
    const token = localStorage.getItem("auth");
    return token;
  },
});

const convertFileToBase64 = (file: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(file.rawFile);
  });

const getSignedUrl = (
  key: string,
  bucket: string
): TE.TaskEither<Error, CreateResult<string>> => {
  return pipe(
    TE.tryCatch(
      () =>
        dataProvider.create("/uploads/getSignedURL", {
          data: {
            Key: key,
            Bucket: bucket,
          },
        }),
      E.toError
    )
  );
};

const uploadFile = (
  resource: string,
  resourceId: string,
  f: File
): TE.TaskEither<Error, string> => {
  return pipe(
    getSignedUrl("first", "events"),
    TE.chain((url) => {
      // eslint-disable-next-line
      const data = new FormData();
      data.append("file", f, f.name);
      data.append("resource", "events");
      data.append("resourceId", resourceId);
      return pipe(
        TE.tryCatch(
          () =>
            axios.post(url.data, data, {
              headers: {
                "Content-Type": `multipart/form-data;`,
              },
            }),
          E.toError
        ),
        TE.map((result) => {
          // eslint-disable-next-line no-console
          console.log(result);
          return result.data.body.data.Location;
        })
      );
    })
  );
};

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const response = await publicDataProvider.create<{ token: string }>(
      "users/login",
      {
        data: { username, password },
      }
    );

    localStorage.setItem("auth", response.data.token);
    return response;
  },
  logout: async () => {
    localStorage.removeItem("auth");
    return await Promise.resolve(undefined);
  },
  checkAuth: async () =>
    localStorage.getItem("auth")
      ? await Promise.resolve()
      : await Promise.reject(new Error("Missing auth")),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
};

export const apiProvider: http.APIRESTClient = {
  ...dataProvider,
  create: (resource, params) => {
    if (resource === "actors" || resource === "groups") {
      // eslint-disable-next-line no-console
      const { avatar, ...data } = params.data;
      return convertFileToBase64(avatar).then((base64) => {
        const finalData = {
          ...data,
          avatar: {
            path: avatar.rawFile.path,
            src: base64,
          },
        };
        return dataProvider.create(resource, {
          ...params,
          data: finalData,
        });
      });
    }

    return dataProvider.create(resource, params);
  },
  update: (resource, params) => {
    if (resource === "events") {
      // eslint-disable-next-line
      console.log(params.data);
      const newImages: any[] = params.data.images.filter(
        (i: any) => i.id === undefined
      );
      return pipe(
        newImages.map((n: any) =>
          uploadFile("events", params.id.toString(), n.location)
        ),
        A.sequence(TE.taskEitherSeq),
        TE.chain((result) => {
          // eslint-disable-next-line
          console.log({ result });
          const updateParams = {
            ...params,
            data: {
              ...params.data,
              images: result.map((l) => ({
                location: l,
                description: params.data.images[0].description,
              })),
            },
          };
          return TE.tryCatch(
            () => dataProvider.update<any>(resource, updateParams),
            E.toError
          );
        }),
        TE.fold(T.task.of, (result) => T.of(result as any))
      )();
    }

    if (resource === "actors" || resource === "groups") {
      // eslint-disable-next-line no-console
      if (typeof params.data.avatar === "object") {
        return convertFileToBase64(params.data.avatar).then((base64) => {
          const finalData = {
            ...params.data,
            avatar: {
              path: params.data.avatar.rawFile.path,
              src: base64,
            },
          };
          return dataProvider.update(resource, {
            ...params,
            data: finalData,
          });
        });
      } else if (typeof params.data.avatar === "string") {
        const { avatar, ...data } = params.data;
        return dataProvider.update(resource, {
          ...params,
          data,
        });
      }
    }
    return dataProvider.update(resource, params);
  },
};
