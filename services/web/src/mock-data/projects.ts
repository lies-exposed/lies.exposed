import { Project } from "@econnessione/io"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import { subDays, subYears } from "date-fns"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import { firstImage } from "./images"
import { firstPolygon } from "./polygons"

const today = new Date()

export const firstGoodProject: Project.ProjectFrontmatter = {
  id: uuid(),
  type: 'ProjectFrontmatter',
  name: "Good Project",
  color: generateRandomColor(),
  areas: O.none,
  images: O.some([
    {
      author: 'Unknown',
      description: O.some("first image"),
      image: firstImage,
    },
  ]),
  startDate: subYears(today, 3),
  endDate: O.none,
  createdAt: subDays(today, 7),
  updatedAt: today,
}

export const firstBadProject: Project.ProjectFrontmatter = {
  id: uuid(),
  type: 'ProjectFrontmatter',
  name: "Bad Project",
  areas: O.some(NEA.of(firstPolygon)),
  images: O.some([
    {
      author: 'Unknown',
      description: O.some("first image"),
      image: firstImage,
    },
  ]),
  startDate: subYears(today, 3),
  createdAt: subDays(today, 7),
  updatedAt: today,
  color: generateRandomColor(),
  endDate: O.none,
}

export const projects = [firstGoodProject, firstBadProject]
