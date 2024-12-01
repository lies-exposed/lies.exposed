import { type FSClient } from "../providers/fs/fs.provider.js";

export interface FSClientContext {
  fs: FSClient;
}
