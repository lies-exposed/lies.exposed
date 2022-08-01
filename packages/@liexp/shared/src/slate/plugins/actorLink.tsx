import { pluginFactories } from "@react-page/plugins-slate";
import { RaSelectReferenceInputField } from "@react-page/react-admin";
import * as React from "react";

const ActorIdSelector = (props: any): JSX.Element => (
  <RaSelectReferenceInputField
    {...props}
    optionText="fullName"
    reference="actors"
    label="Actor"
    filterToQuery={(fullName: any) => ({ fullName })}
  />
);

export const actorLinkPlugin = pluginFactories.createComponentPlugin<{
  actorId: string;
}>({
  type: "actor-link",
  addHoverButton: true,
  addToolbarButton: true,
  label: "Actor Link",
  object: "inline",
  icon: <span>Actor</span>,
  // render the data as usual
  getStyle: () => ({ display: "inline-block" }),
  Component: (props) => {
    return (
      <div
        style={props.style}
        // params={{
        //   pagination: { perPage: 1, page: 1 },
        //   filter: { ids: [props.actorId] },
        //   sort: { field: "createdAt", order: "DESC" },
        // }}
        // onItemClick={() => {}}
      />
    );
  },
  controls: {
    type: "autoform",
    schema: {
      required: ["actorId"],
      properties: {
        actorId: {
          type: "string",
          uniforms: {
            component: ActorIdSelector,
          },
        },
      },
    },
  },
});
