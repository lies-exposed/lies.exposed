/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/order */
import moduleAlias from "module-alias";
import * as path from "path";
moduleAlias(path.resolve(__dirname, "../package.json"));


export default async (): Promise<void> => {
  return Promise.resolve()
};
