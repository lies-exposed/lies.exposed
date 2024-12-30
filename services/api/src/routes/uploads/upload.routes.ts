import { type Router } from "express";
import { MakeSignedUrlRoute } from "./getSignedURL.controller.js";
import { MakeUploadFileRoute } from "./uploadFile.controller.js";
import { MakeUploadMultipartFileRoute } from "./uploadMultipartFile.controller.js";
import { type ServerContext } from "#context/context.type.js";

export const MakeUploadsRoutes = (router: Router, ctx: ServerContext): void => {
  MakeSignedUrlRoute(router, ctx);
  MakeUploadMultipartFileRoute(router, ctx);
  MakeUploadFileRoute(router, ctx);
};
