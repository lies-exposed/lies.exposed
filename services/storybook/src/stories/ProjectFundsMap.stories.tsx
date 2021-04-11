import {
  ProjectAreasMap,
  ProjectAreasMapProps,
} from "@econnessione/shared/components/Graph/ProjectAreasMap";
import { firstGoodProject } from "@econnessione/shared/mock-data/projects";
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
