import path from "path";
import { fp } from "@liexp/core/lib/fp/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ClientContext } from "../context.js";
import { type ClientContextRTE } from "../types.js";
import { toAIBotError } from "#common/error/index.js";

const tokenFilePath = path.resolve(process.cwd(), "temp/.token");

export const clearToken: ClientContextRTE<void> = pipe(
  (ctx: ClientContext) => ctx.fs.deleteObject(tokenFilePath),
  fp.RTE.mapLeft(toAIBotError),
);
