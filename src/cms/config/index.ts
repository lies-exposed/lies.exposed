import { CmsConfig } from "netlify-cms-core"
import { actors } from "./collections/actors"
import { areas } from "./collections/areas"
import { articles } from "./collections/articles"
import { events } from "./collections/events"
import { groups } from "./collections/groups"
import { pages } from "./collections/pages"
import { projects } from "./collections/projects"
import { topics } from "./collections/topics"

interface CmsConfigV2 extends CmsConfig {
  local_backend?: boolean | { url: string }
}

const collections = [
  events,
  articles,
  actors,
  groups,
  pages,
  topics,
  areas,
  projects,
]

export const config: CmsConfigV2 = {
  backend: {
    name: "git-gateway",
    repo: "ascariandrea/econnessione",
    open_authoring: process.env.NODE_ENV === "production",
  },
  local_backend:
    process.env.NODE_ENV === "development"
      ? {
          url: "http://localhost:8082/api/v1",
        }
      : false,
  publish_mode:
    process.env.NODE_ENV === "development" ? "simple" : "editorial_workflow",
  media_folder: "static/media",
  public_folder: "media",
  collections,
}
