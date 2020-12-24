import * as t from "io-ts"
import { ByActor, ByGroup, ByGroupOrActor } from "./Common/ByGroupOrActor"
import { For, ForGroup, ForProject } from "./Common/For"
import { Impact } from "./Common/Impact"
import { MoneyAmount } from "./Common/MoneyAmount"
import { Point } from "./Common/Point"
import { Polygon } from "./Common/Polygon"
import { BaseFrontmatter } from "./Frontmatter"
import { ImageFileNode, ImageSource } from "./Image"
import { ProjectFrontmatter } from "./Project"
import { TransactionFrontmatter } from "./Transaction"
import { ActorFrontmatter } from "./actor"
import { AreaFrontmatter } from "./area"
import { ArticleFrontmatter } from "./article"
import { Fined } from "./events/Fined"
import { Protest } from "./events/Protest"
import { PublicAnnouncement } from "./events/PublicAnnouncement"
import { StudyPublished } from "./events/StudyPublished"
import { Uncategorized } from "./events/Uncategorized"
import { GroupFrontmatter } from "./group"
import { PageFrontmatter, PageMD } from "./page"
import { TopicFrontmatter } from "./topic"

export const ResourcesNames = t.keyof(
  {
    events: null,
    topics: null,
    actors: null,
    groups: null,
    articles: null,
    areas: null,
    projects: null,
  },
  "ResourcesNames"
)

export type ResourcesNames = t.TypeOf<typeof ResourcesNames>

const Models = {
  Common: {
    BaseFrontmatter,
    ByActor,
    ByGroup,
    ByGroupOrActor,
    ForProject,
    ForGroup,
    For,
    MoneyAmount,
    Impact,
    ImageSource,
    ImageFileNode,
    Point,
    Polygon,
  },
  Frontmatter: {
    ArticleFrontmatter,
    AreaFrontmatter,
    ActorFrontmatter,
    GroupFrontmatter,
    PageFrontmatter,
    ProjectFrontmatter,
    TopicFrontmatter,
    // events
    Protest,
    TransactionFrontmatter,
    PublicAnnouncement,
    Uncategorized,
    Fined,
    StudyPublished,
  },
  MD: {
    PageMD,
  },
}

type Models = {
  [K in keyof typeof Models]: {
    [KK in keyof typeof Models[K]]: typeof Models[K][KK] extends infer C
      ? C extends t.Any
        ? t.TypeOf<C>
        : never
      : never
  }
}
export { Models }
