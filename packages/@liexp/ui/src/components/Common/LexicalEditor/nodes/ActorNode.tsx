import { type Actor } from "@liexp/shared/lib/io/http";
import { type Color } from "@liexp/shared/lib/io/http/Common";
import { type UUID } from "io-ts-types/lib/UUID";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React from "react";
import { Suspense } from "react";

const ActorChipComponent = React.lazy(() =>
  import("../../../actors/ActorChip").then((v) => ({ default: v.ActorChip }))
);

type SimpleActor = Omit<
  Actor.Actor,
  | "excerpt"
  | "body"
  | 'bodyV2'
  | "death"
  | "events"
  | "memberIn"
  | "createdAt"
  | "updatedAt"
>;

export interface ActorPayload extends SimpleActor {
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  displayFullName?: boolean;
  width?: number;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height, attributes } = domNode;
    Array.from({ length: attributes.length }).forEach((_, i) => {
      // eslint-disable-next-line no-console
      console.log(attributes.item(i));
    });

    const id = attributes.getNamedItem("data-id") as any;
    const node = $createActorNode({
      id,
      username: altText,
      fullName: altText,
      color: "#FFFFFF" as any,
      displayFullName: false,
      avatar: src,
      width,
      height,
    });
    return { node };
  }
  return null;
}

export type SerializedActorNode = Spread<
  SimpleActor & { type: string },
  SerializedLexicalNode
>;

export class ActorNode extends DecoratorNode<JSX.Element> {
  __id: UUID;
  __username: string;
  __fullName: string;
  __avatar?: string;
  __color: Color;
  __width: "inherit" | number;
  __height: "inherit" | number;
  __maxWidth: number;
  __displayFullName: boolean;

  static getType(): string {
    return "actor";
  }

  static clone(node: ActorNode): ActorNode {
    return new ActorNode(
      node.__id,
      node.__username,
      node.__fullName,
      node.__avatar,
      node.__color,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__displayFullName,
      node.__key
    );
  }

  static importJSON({ ...serializedNode }: SerializedActorNode): ActorNode {
    const node = $createActorNode({
      ...serializedNode,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__avatar ?? this.__location);
    element.setAttribute("alt", this.__fullName);
    element.setAttribute("width", this.__width.toString());
    element.setAttribute("height", this.__height.toString());
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    id: UUID,
    username: string,
    fullName: string,
    avatar: string | undefined,
    color: Color,
    maxWidth: number,
    width?: "inherit" | number,
    height?: "inherit" | number,
    displayFullName?: boolean,
    key?: NodeKey
  ) {
    super(key);
    this.__id = id;
    this.__username = username;
    this.__fullName = fullName;
    this.__avatar = avatar;
    this.__color = color;
    this.__maxWidth = maxWidth;
    this.__width = width ?? "inherit";
    this.__height = height ?? "inherit";
    this.__displayFullName = displayFullName ?? false;
  }

  exportJSON(): SerializedActorNode {
    return {
      id: this.__id,
      username: this.__username,
      fullName: this.__fullName,
      avatar: this.__avatar,
      color: this.__color,
      type: "actor",
      version: 1,
    };
  }

  setWidthAndHeight(
    width: "inherit" | number,
    height: "inherit" | number
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(displayFullName: boolean): void {
    const writable = this.getWritable();
    writable.__displayFullName = displayFullName;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__avatar ?? this.__location;
  }

  getAltText(): string {
    return this.__fullName;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <ActorChipComponent
          displayFullName={this.__displayFullName}
          actor={{
            id: this.__id,
            fullName: this.__fullName,
            avatar: this.__avatar,
            color: this.__color,
            username: this.__username,
            death: undefined,
            excerpt: null,
            body: null,
            bodyV2: null,
            memberIn: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
        />
      </Suspense>
    );
  }
}

export function $createActorNode({
  id,
  username,
  fullName,
  avatar,
  color,
  height,
  maxWidth = 500,
  width,
  displayFullName,
  key,
}: ActorPayload): ActorNode {
  return $applyNodeReplacement(
    new ActorNode(
      id,
      username,
      fullName,
      avatar,
      color,
      maxWidth,
      width,
      height,
      displayFullName,
      key
    )
  );
}

export function $isActorNode(
  node: LexicalNode | null | undefined
): node is ActorNode {
  return node instanceof ActorNode;
}
