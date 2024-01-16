import { LinkArb } from "@liexp/shared/lib/tests/index.js";
import { fc } from "@liexp/test";
import LinkCard, {
  type LinkCardProps,
} from "@liexp/ui/lib/components/Cards/LinkCard.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Links/LinkCard",
  component: LinkCard,
};

export default meta;

const Template: StoryFn<LinkCardProps> = (props) => {
  return <LinkCard {...props} />;
};

const LinkCardExample = Template.bind({});

const args: LinkCardProps = {
  link: { ...fc.sample(LinkArb, 1)[0], selected: false },
  onClick: () => undefined,
};

LinkCardExample.args = args;

export { LinkCardExample as LinkCard };
