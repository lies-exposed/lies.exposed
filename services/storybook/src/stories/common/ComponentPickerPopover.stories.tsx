import {
  ComponentPickerPopoverControl,
  ComponentPickerPopoverRenderer,
  type ComponentPickerPopoverState,
} from "@liexp/ui/lib/components/Common/Editor/plugins/ComponentPickerPopover/index.js";
import { CircularProgress } from "@liexp/ui/lib/components/mui/index.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/Editor/ComponentPickerPopover",
  component: ComponentPickerPopoverControl,
  argTypes: {},
};

export default meta;

const Template: StoryFn<any> = (props) => {
  const ref = React.createRef<HTMLElement>();

  const [{ plugin, load }, setData] =
    React.useState<ComponentPickerPopoverState>({
      plugin: undefined,
      load: false,
    } as any);

  const control = React.useMemo(() => {
    if (load) {
      return (
        <ComponentPickerPopoverControl
          {...props}
          open={true}
          isActive={true}
          data={{ plugin }}
          close={() => {}}
          add={({ data }) => {
            setData(
              data ? { ...data, load } : { load, plugin: undefined as any },
            );
          }}
        />
      );
    }

    return <CircularProgress />;
  }, [plugin, load]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <ComponentPickerPopoverRenderer
        plugin={plugin}
        getTextContents={() => []}
        useFocused={() => false}
        useSelected={() => false}
        childNodes={[]}
      >
        Content
      </ComponentPickerPopoverRenderer>
      {control}
    </div>
  );
};

export const ComponentPickerPopoverExample = Template.bind({});
ComponentPickerPopoverExample.args = {};
