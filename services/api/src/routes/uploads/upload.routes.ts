import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import { MakeSignedUrlRoute } from "./getSignedURL.controller";
import { MakeUploadFileRoute } from "./uploadFile.controller.ts";

export const MakeUploadsRoutes = (router: Router, ctx: RouteContext): void => {
  MakeSignedUrlRoute(router, ctx);
  MakeUploadFileRoute(router, ctx);
};
