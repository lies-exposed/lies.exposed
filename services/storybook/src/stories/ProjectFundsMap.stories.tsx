import { firstGoodProject } from "@liexp/shared/mock-data/projects";
import {
  ProjectAreasMap,
  ProjectAreasMapProps,
} from "@liexp/ui/components/Graph/ProjectAreasMap";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/ProjectAreasMap",
  component: ProjectAreasMap,
};

export default meta;

const Template: Story<ProjectAreasMapProps> = (props) => {
  return <ProjectAreasMap {...props} />;
};

const ProjectAreasMapExample = Template.bind({});

const args: ProjectAreasMapProps = {
  project: firstGoodProject,
};

ProjectAreasMapExample.args = args;

export { ProjectAreasMapExample };
