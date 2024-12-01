import { type SpaceProvider } from "../providers/space/index.js";

export interface SpaceContext {
  s3: SpaceProvider.SpaceProvider;
}
