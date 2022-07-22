import { fc } from "@liexp/core/tests";
import { LinkArb } from "@liexp/shared/tests";
import { LinksList, LinksListProps } from "@liexp/ui/components/lists/LinkList";
import { Meta, Story } from "@storybook/react/types-6-0";
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
  links: fc.sample(LinkArb, 10).map((l) => ({ ...l, selected: false })),
  column: 2,
  onItemClick: () => undefined,
};

LinkCardExample.args = args;

export { LinkCardExample as LinksList };
