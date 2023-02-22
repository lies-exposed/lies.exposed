import { type Router } from "express";
import { MakeSignedUrlRoute } from "./getSignedURL.controller";
import { MakeUploadFileRoute } from "./uploadFile.controller";
import { MakeUploadMultipartFileRoute } from "./uploadMultipartFile.controller";
import { type RouteContext } from "@routes/route.types";

export const MakeUploadsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSignedUrlRoute(router, ctx);
  MakeUploadMultipartFileRoute(router, ctx);
  MakeUploadFileRoute(router, ctx);
};
