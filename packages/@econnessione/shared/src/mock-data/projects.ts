import { addYears, subDays, subYears } from "date-fns";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import { Project } from "../io/http";
import { generateRandomColor } from "../utils/colors";
import { uuid } from "../utils/uuid";
import { firstArea } from "./areas";
import { firstImage } from "./images";

const today = new Date();

export const firstGoodProject: Project.Project = {
  id: uuid() as any,
  name: "Good Project",
  color: generateRandomColor(),
  areas: [firstArea],
  media: [
    {
      ...firstImage,
      id: uuid() as any,
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
  id: uuid() as any,
  name: "Bad Project",
  areas: NEA.of(firstArea),
  media: [
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
