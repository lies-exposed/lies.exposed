import {
  ACTOR_INLINE,
  EVENT_BLOCK_PLUGIN,
  GROUP_INLINE,
  KEYWORD_INLINE,
  LINK_INLINE,
  MEDIA_BLOCK_PLUGIN,
} from "@liexp/shared/lib/slate/plugins/customSlate";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { type SlateComponentPluginDefinition } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import React from "react";
import { CircularProgress } from "../../../../mui";
import { ActorInlineRenderer } from "../actor/ActorInline.plugin";
import { EventBlockPluginRenderer } from "../event/eventBlock.plugin";
import { GroupInlineRenderer } from "../group/GroupInline.plugin";
import { KeywordInlineRenderer } from "../keyword/KeywordInline.plugin";
import { LinkInlineRenderer } from "../links/LinkInline.plugin";
import { MediaBlockPluginRenderer } from "../media/mediaBlock";
import {
  ComponentPickerPopoverRendererAnchorWrapper,
} from "./ComponentPickerPopoverPluginControlAnchor";
import { type ComponentPickerPopoverState } from "./types";

export const ComponentPickerPopoverRenderer: SlateComponentPluginDefinition<ComponentPickerPopoverState>["Component"] =
  ({ plugin, readOnly, useSelected, ...props }) => {
    const isSelected = useSelected();

    const pluginRenderer = React.useMemo(() => {
      if (plugin.data) {
        switch (plugin.type) {
          case ACTOR_INLINE: {
            return (
              <ActorInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
            );
          }
          case GROUP_INLINE: {
            return (
              <GroupInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
            );
          }
          case KEYWORD_INLINE: {
            return (
              <KeywordInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
            );
          }
          case LINK_INLINE: {
            return (
              <LinkInlineRenderer
                {...{ ...props, useSelected, ...plugin.data }}
              />
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
      return null;
    }, [plugin.data, plugin.type]);

    return (
      <span>
        <ComponentPickerPopoverRendererAnchorWrapper
          readOnly={readOnly as boolean}
          isSelected={isSelected}
          hasData={!!plugin}
        >
          <React.Suspense fallback={<CircularProgress />}>
            {pluginRenderer}
          </React.Suspense>
        </ComponentPickerPopoverRendererAnchorWrapper>
      </span>
    );
  };
