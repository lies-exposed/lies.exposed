import { addYears, subDays, subYears } from "date-fns";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import { firstArea } from "./areas";
import { firstImage } from "./images";
import { Project } from "@io/http";
import { generateRandomColor } from "@utils/colors";
import { uuid } from "@utils/uuid";

const today = new Date();

export const firstGoodProject: Project.Project = {
  id: uuid(),
  name: "Good Project",
  color: generateRandomColor(),
  areas: [firstArea],
  images: [
    {
      ...firstImage,
      id: uuid(),
      kind: "PRACTICE",
      projectId: "uuid",
    },
  ],
  startDate: subYears(today, 3),
  endDate: addYears(today, 10),
  createdAt: subDays(today, 7),
  updatedAt: today,
  body: "",
};

export const firstBadProject: Project.Project = {
  id: uuid(),
  name: "Bad Project",
  areas: NEA.of(firstArea),
  images: [
    {
      ...firstImage,
      kind: "PRACTICE",
      projectId: "",
    },
  ],
  startDate: subYears(today, 3),
  createdAt: subDays(today, 7),
  updatedAt: today,
  color: generateRandomColor(),
  endDate: addYears(today, 1),
  body: "",
};

export const projects = [firstGoodProject, firstBadProject];
