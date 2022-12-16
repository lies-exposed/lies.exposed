import { LinkArb } from "@liexp/shared/tests";
import { fc } from "@liexp/test";
import { LinksList, type LinksListProps } from "@liexp/ui/components/lists/LinkList";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from 'react';

const meta: Meta = {
  title: "Components/Lists/Links",
  component: LinksList,
};

export default meta;

const Template: Story<LinksListProps> = (props) => {
  return <LinksList {...props} />;
};

const LinkCardExample = Template.bind({});

const args: LinksListProps = {
  links: fc.sample(LinkArb, 10).map((l: any) => ({ ...l, selected: false })),
  column: 2,
  onItemClick: () => undefined,
};

LinkCardExample.args = args;

export { LinkCardExample as LinksList };
