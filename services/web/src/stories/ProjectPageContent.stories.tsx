import {
  ProjectPageContent,
  ProjectPageContentProps,
} from "@components/ProjectPageContent";
import { projectPageContentExampleArgs } from "@components/examples/ProjectPageContentExample";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Block } from "baseui/block";
import { HeadingLarge } from "baseui/typography";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/ProjectPageContent",
  component: ProjectPageContent,
};

export default meta;

const Template: Story<ProjectPageContentProps> = (props) => {
  return (
    <Block overrides={{ Block: { style: { width: "100%" } } }}>
      <HeadingLarge>TODO</HeadingLarge>
      <ul>
        <li> Lista dei fondi </li>
        <li> Lista degli impatti</li>
        <li> Lista delle proteste</li>
      </ul>
      <ProjectPageContent {...props} />
    </Block>
  );
};

const ProjectPageContentExample = Template.bind({});

ProjectPageContentExample.args = projectPageContentExampleArgs;

export { ProjectPageContentExample };
