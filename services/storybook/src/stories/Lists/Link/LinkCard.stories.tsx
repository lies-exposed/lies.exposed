import { fc } from "@liexp/core/tests";
import { LinkArb } from "@liexp/shared/tests";
import LinkCard, { LinkCardProps } from "@liexp/ui/components/Cards/LinkCard";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from 'react';

const meta: Meta = {
  title: "Components/Lists/Links/LinkCard",
  component: LinkCard,
};

export default meta;

const Template: Story<LinkCardProps> = (props) => {
  return <LinkCard {...props} />;
};

const LinkCardExample = Template.bind({});

const args: LinkCardProps = {
  link: { ...fc.sample(LinkArb, 1)[0], selected: false },
  onClick: () => undefined,
};

LinkCardExample.args = args;

export { LinkCardExample as LinkCard };
