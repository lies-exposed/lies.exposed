import { type Router } from "express";
import { type RouteContext } from "./route.types";
import { MakeProjectImageRoutes } from "@routes/ProjectImages/ProjectImage.routes";
import { MakeActorRoutes } from "@routes/actors/actors.routes";
import { MakeAdminRoutes } from "@routes/admin/admin.routes";
import { MakeAreasRoutes } from "@routes/areas/Areas.routes";
import { MakeBookEventsRoutes } from "@routes/events/books/book.routes";
import { MakeDeathEventsRoutes } from "@routes/events/deaths/death.routes";
import { MakeDocumentaryReleaseRoutes } from "@routes/events/documentary/documentary.routes";
import { MakeEventRoutes } from "@routes/events/event.routes";
import { MakePatentEventsRoutes } from "@routes/events/patents/patent.routes";
import { MakeQuoteRoutes } from "@routes/events/quotes/quote.routes";
import { MakeScientificStudyRoutes } from "@routes/events/scientific-study/ScientificStudyRoute.route";
import { MakeTransactionEventsRoutes } from "@routes/events/transactions/transaction.routes";
import { MakeGraphsRoutes } from "@routes/graphs/graphs.routes";
import { MakeGroupRoutes } from "@routes/groups/groups.route";
import { MakeGroupMemberRoutes } from "@routes/groups-members/GroupMember.route";
import { MakeHealthcheckRoutes } from "@routes/healthcheck/healthcheck.routes";
import { MakeKeywordRoutes } from "@routes/keywords/keywords.routes";
import { MakeLinkRoutes } from "@routes/links/LinkRoute.route";
import { MakeMediaRoutes } from "@routes/media/media.routes";
import { MakeNetworksRoutes } from "@routes/networks/networks.routes";
import { MakeOpenGraphRoutes } from "@routes/open-graph/openGraph.routes";
import { MakePageRoutes } from "@routes/pages/pages.route";
import { MakeProjectRoutes } from "@routes/projects/project.routes";
import { MakeSocialPostRoutes } from "@routes/social-posts/socialPost.routes";
import { MakeStatsRoutes } from "@routes/stats/stats.routes";
import { MakeStoriesRoutes } from "@routes/stories/stories.route";
import { MakeUploadsRoutes } from "@routes/uploads/upload.routes";
import { MakeUserRoutes } from "@routes/users/User.routes";

export const AddRoutes = (router: Router, ctx: RouteContext): Router => {
  // healthcheck
  MakeHealthcheckRoutes(router, ctx);

  // users
  MakeUserRoutes(router, ctx);

  // pages
  MakePageRoutes(router, ctx);

  // groups
  MakeGroupRoutes(router, ctx);
  MakeGroupMemberRoutes(router, ctx);

  // actors
  MakeActorRoutes(router, ctx);

  // areas
  MakeAreasRoutes(router, ctx);

  // projects
  MakeProjectRoutes(router, ctx);

  // project images
  MakeProjectImageRoutes(router, ctx);

  // stories
  MakeStoriesRoutes(router, ctx);

  // media
  MakeMediaRoutes(router, ctx);

  // events
  MakeEventRoutes(router, ctx);
  MakeDeathEventsRoutes(router, ctx);
  MakeScientificStudyRoutes(router, ctx);
  MakePatentEventsRoutes(router, ctx);
  MakeDocumentaryReleaseRoutes(router, ctx);
  MakeTransactionEventsRoutes(router, ctx);
  MakeQuoteRoutes(router, ctx);
  MakeBookEventsRoutes(router, ctx);

  // links
  MakeLinkRoutes(router, ctx);
  MakeKeywordRoutes(router, ctx);

  // graphs data
  MakeGraphsRoutes(router, ctx);

  // open graphs
  MakeOpenGraphRoutes(router, ctx);

  // stats
  MakeStatsRoutes(router, ctx);

  // networks
  MakeNetworksRoutes(router, ctx);

  // uploads
  MakeUploadsRoutes(router, ctx);

  // admin
  MakeAdminRoutes(router, ctx);
  // social posts
  MakeSocialPostRoutes(router, ctx);

  return router;
};
