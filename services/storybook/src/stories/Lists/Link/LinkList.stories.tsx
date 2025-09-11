import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import {
  LinksList,
  type LinksListProps,
} from "@liexp/ui/lib/components/lists/LinkList.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import fc from "fast-check";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Links",
  component: LinksList,
};

export default meta;

const Template: StoryFn<LinksListProps> = (props) => {
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
