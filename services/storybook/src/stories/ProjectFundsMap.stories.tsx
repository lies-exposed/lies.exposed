import { firstGoodProject } from "@liexp/shared/lib/mock-data/projects";
import {
  ProjectAreasMap,
  type ProjectAreasMapProps,
} from "@liexp/ui/lib/components/Graph/ProjectAreasMap";
import { type Meta, type StoryFn } from "@storybook/react";
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

const args: ProjectAreasMapProps = {
  project: firstGoodProject,
};

ProjectAreasMapExample.args = args;

export { ProjectAreasMapExample };
