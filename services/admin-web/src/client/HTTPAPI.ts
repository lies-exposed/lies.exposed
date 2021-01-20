import { http } from "@econnessione/core";

const dataProvider = http.APIRESTClient({
  url: "http://localhost:4010/v1",
});

const convertFileToBase64 = (file: any): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;

    reader.readAsDataURL(file.rawFile);
  });

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
