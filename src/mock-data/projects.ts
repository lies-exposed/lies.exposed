import { ProjectFrontmatter } from "@models/Project"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import { subDays, subYears } from "date-fns"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import { firstImage } from "./images"
import { firstPolygon } from "./polygons"

export const firstProject: ProjectFrontmatter = {
  uuid: uuid(),
  name: "First Project",
  areas: O.some(NEA.of(firstPolygon)),
  images: O.some([
    {
      description: O.some("first image"),
      image: firstImage,
    },
  ]),
  startDate: subYears(new Date(), 3),
  date: subDays(new Date(), 7),
  color: generateRandomColor(),
  endDate: O.none,
}
