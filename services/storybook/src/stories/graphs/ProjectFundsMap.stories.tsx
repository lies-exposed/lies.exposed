import {
  ProjectAreasMap,
  type ProjectAreasMapProps,
} from "@liexp/ui/lib/components/Graph/ProjectAreasMap.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/ProjectAreasMap",
  component: ProjectAreasMap,
};

export default meta;

const Template: StoryFn<ProjectAreasMapProps> = (props) => {
  return <ProjectAreasMap {...props} />;
};

const ProjectAreasMapExample = Template.bind({});

ProjectAreasMapExample.args = {};

export { ProjectAreasMapExample };
