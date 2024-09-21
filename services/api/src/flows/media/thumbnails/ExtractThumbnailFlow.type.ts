import { type TEFlow } from "#flows/flow.types.js";

export type ExtractThumbnailFromMediaFlow<T> = TEFlow<[T], ArrayBuffer[]>;
