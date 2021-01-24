import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";

export const GetSignedURL = Endpoint({
  Method: "POST",
  getPath: () => `/uploads/getSignedURL`,
  Input: {
    Body: t.strict({ Bucket: t.string, Key: t.string }),
  },
  Output: t.strict({ data: t.string }),
});
