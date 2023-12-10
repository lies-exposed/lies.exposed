import { type Router } from "express";
import { MakeSignedUrlRoute } from "./getSignedURL.controller.js";
import { MakeUploadFileRoute } from "./uploadFile.controller.js";
import { MakeUploadMultipartFileRoute } from "./uploadMultipartFile.controller.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeUploadsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSignedUrlRoute(router, ctx);
  MakeUploadMultipartFileRoute(router, ctx);
  MakeUploadFileRoute(router, ctx);
};
