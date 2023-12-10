import { type Router } from "express";
import { type RouteContext } from "./route.types.js";
import { MakeProjectImageRoutes } from "#routes/ProjectImages/ProjectImage.routes.js";
import { MakeActorRoutes } from "#routes/actors/actors.routes.js";
import { MakeAdminRoutes } from "#routes/admin/admin.routes.js";
import { MakeAreasRoutes } from "#routes/areas/Areas.routes.js";
import { MakeBookEventsRoutes } from "#routes/events/books/book.routes.js";
import { MakeDeathEventsRoutes } from "#routes/events/deaths/death.routes.js";
import { MakeDocumentaryReleaseRoutes } from "#routes/events/documentary/documentary.routes.js";
import { MakeEventRoutes } from "#routes/events/event.routes.js";
import { MakePatentEventsRoutes } from "#routes/events/patents/patent.routes.js";
import { MakeQuoteRoutes } from "#routes/events/quotes/quote.routes.js";
import { MakeScientificStudyRoutes } from "#routes/events/scientific-study/ScientificStudyRoute.route.js";
import { MakeTransactionEventsRoutes } from "#routes/events/transactions/transaction.routes.js";
import { MakeGraphsRoutes } from "#routes/graphs/graphs.routes.js";
import { MakeGroupRoutes } from "#routes/groups/groups.route.js";
import { MakeGroupMemberRoutes } from "#routes/groups-members/GroupMember.route.js";
import { MakeHealthcheckRoutes } from "#routes/healthcheck/healthcheck.routes.js";
import { MakeKeywordRoutes } from "#routes/keywords/keywords.routes.js";
import { MakeLinkRoutes } from "#routes/links/LinkRoute.route.js";
import { MakeMediaRoutes } from "#routes/media/media.routes.js";
import { MakeNetworksRoutes } from "#routes/networks/networks.routes.js";
import { MakeOpenGraphRoutes } from "#routes/open-graph/openGraph.routes.js";
import { MakePageRoutes } from "#routes/pages/pages.route.js";
import { MakeProjectRoutes } from "#routes/projects/project.routes.js";
import { MakeSocialPostRoutes } from "#routes/social-posts/socialPost.routes.js";
import { MakeStatsRoutes } from "#routes/stats/stats.routes.js";
import { MakeStoriesRoutes } from "#routes/stories/stories.route.js";
import { MakeUploadsRoutes } from "#routes/uploads/upload.routes.js";
import { MakeUserRoutes } from "#routes/users/User.routes.js";

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
