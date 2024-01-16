import {
  ACTOR_INLINE,
  EVENT_BLOCK_PLUGIN,
  GROUP_INLINE,
  KEYWORD_INLINE,
  LINK_INLINE,
  MEDIA_BLOCK_PLUGIN,
} from "@liexp/shared/lib/slate/plugins/customSlate.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import { type SlateComponentPluginDefinition } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions.js";
import React from "react";
import { CircularProgress } from "../../../../mui/index.js";
import { ActorInlineRenderer } from "../actor/ActorInline.plugin.js";
import { EventBlockPluginRenderer } from "../event/eventBlock.plugin.js";
import { GroupInlineRenderer } from "../group/GroupInline.plugin.js";
import { KeywordInlineRenderer } from "../keyword/KeywordInline.plugin.js";
import { LinkInlineRenderer } from "../links/LinkInline.plugin.js";
import { MediaBlockPluginRenderer } from "../media/mediaBlock.js";
import { ComponentPickerPopoverRendererAnchorWrapper } from "./ComponentPickerPopoverPluginControlAnchor.js";
import { type ComponentPickerPopoverState } from "./types.js";

export const ComponentPickerPopoverRenderer: SlateComponentPluginDefinition<ComponentPickerPopoverState>["Component"] =
  ({ plugin, ...props }) => {
    const isSelected = props.useSelected();
    const isFocused = props.useFocused();
    const readOnly = props.readOnly === true;

    const pluginRenderer = React.useMemo(() => {
      if (plugin?.data) {
        switch (plugin.type) {
          case ACTOR_INLINE: {
            return (
              <ActorInlineRenderer
                {...{ ...props, readOnly, ...plugin.data }}
              />
            );
          }
          case GROUP_INLINE: {
            return (
              <GroupInlineRenderer
                {...{ ...props, readOnly, ...plugin.data }}
              />
            );
          }
          case KEYWORD_INLINE: {
            return (
              <KeywordInlineRenderer
                {...{ ...props, readOnly, ...plugin.data }}
              />
            );
          }
          case LINK_INLINE: {
            return (
              <LinkInlineRenderer {...{ ...props, readOnly, ...plugin.data }} />
            );
          }
          case EVENT_BLOCK_PLUGIN: {
            return (
              <EventBlockPluginRenderer
                {...props}
                data={plugin.data}
                readOnly={true}
                focused={false}
                isPreviewMode={false}
                isEditMode={false}
                nodeId={uuid()}
                onChange={() => {}}
              />
            );
          }
          case MEDIA_BLOCK_PLUGIN: {
            return (
              <MediaBlockPluginRenderer
                {...props}
                readOnly={true}
                focused={false}
                isPreviewMode={false}
                isEditMode={false}
                nodeId={uuid()}
                onChange={() => {}}
                data={plugin.data}
              />
            );
          }
          default: {
            // eslint-disable-next-line no-console
            console.log({ ...props, plugin });
            return <span>Unknown plugin: {(plugin as any).type}</span>;
          }
        }
      }

      return (
        <ComponentPickerPopoverRendererAnchorWrapper
          name={`component-plugin-${JSON.stringify(plugin?.data ?? {})}`}
          readOnly={readOnly}
          isSelected={isSelected}
          hasData={!!plugin}
        />
      );
    }, [plugin?.data, plugin?.type, isSelected, isFocused, readOnly]);

    return (
      <span>
        <React.Suspense fallback={<CircularProgress />}>
          {pluginRenderer}
        </React.Suspense>
      </span>
    );
  };
