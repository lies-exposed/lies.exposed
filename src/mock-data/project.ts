import { ProjectFrontmatter } from "@models/Project"
import uuid from "@utils/uuid"
import { subDays, subYears } from "date-fns"
import * as O from "fp-ts/lib/Option"
import { firstPolygon } from "./polygons"

export const project: ProjectFrontmatter = {
  uuid: uuid(),
  name: "First Project",
  areas: [firstPolygon],
  images: [],
  startDate: subYears(new Date(), 3),
  date: subDays(new Date(), 7),
  endDate: O.none,
}
