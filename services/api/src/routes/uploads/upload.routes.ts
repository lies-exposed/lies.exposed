import { Router } from "express";
import { MakeSignedUrlRoute } from "./getSignedURL.controller";
import { MakeUploadFileRoute } from "./uploadFile.controller.ts";
import { RouteContext } from "@routes/route.types";

export const MakeUploadsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSignedUrlRoute(router, ctx);
  MakeUploadFileRoute(router, ctx);
};
