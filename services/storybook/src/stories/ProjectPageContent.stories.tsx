import {
  ProjectPageContent,
  ProjectPageContentProps,
} from "@liexp/ui/components/ProjectPageContent";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/ProjectPageContent",
  component: ProjectPageContent,
};

export default meta;

const Template: Story<ProjectPageContentProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <h1>TODO</h1>
      <ul>
        <li> Lista dei fondi </li>
        <li> Lista degli impatti</li>
        <li> Lista delle proteste</li>
      </ul>
      <ProjectPageContent {...props} />
    </div>
  );
};

const ProjectPageContentExample = Template.bind({});

ProjectPageContentExample.args = {};

export { ProjectPageContentExample };
