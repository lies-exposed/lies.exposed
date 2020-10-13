import { Project } from "@models/Project"
import uuid from "@utils/uuid"
import { subDays, subYears } from "date-fns"
import * as O from "fp-ts/lib/Option"
import { firstPolygon } from "./polygons"

export const project: Project = {
  uuid: uuid(),
  name: "First Project",
  areas: [firstPolygon],
  startDate: subYears(new Date(), 3),
  date: subDays(new Date(), 7),
  endDate: O.none,
}
