import { fp } from "@liexp/core/lib/fp";
import { type ParseURLResult, parseURL } from "@liexp/shared/lib/helpers/media";
import { Media } from "@liexp/shared/lib/io/http";
import { pipe } from "fp-ts/lib/function";
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

const MediaElementComponent = React.lazy(
  () => import("../../../Media/MediaElement")
);

type SimpleMedia = Omit<
  Media.Media,
  | "creator"
  | "events"
  | "links"
  | "keywords"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export interface MediaPayload extends SimpleMedia {
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  width?: number;
  captionsEnabled?: boolean;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height, attributes } = domNode;
    Array.from({ length: attributes.length }).forEach((_, i) => {
      // eslint-disable-next-line no-console
      console.log(attributes.item(i));
    });

    const id = attributes.getNamedItem("data-id") as any;
    const node = $createMediaNode({
      id,
      description: altText,
      height,
      location: src,
      thumbnail: src,
      width,
      type: pipe(
        parseURL(src),
        fp.E.getOrElse(
          (): ParseURLResult => ({
            type: Media.MediaType.types[0].value,
            location: src,
          })
        )
      ).type,
    });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  Omit<SimpleMedia, "type"> & { _type: Media.MediaType; type: string },
  SerializedLexicalNode
>;

export class MediaNode extends DecoratorNode<JSX.Element> {
  __id: UUID;
  __thumbnail?: string;
  __location: string;
  __altText: string;
  __width: "inherit" | number;
  __height: "inherit" | number;
  __mediaType: Media.MediaType;
  __maxWidth: number;
  __showCaption: boolean;
  __caption?: string;
  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean;

  static getType(): string {
    return "media";
  }

  static clone(node: MediaNode): MediaNode {
    return new MediaNode(
      node.__id,
      node.__location,
      node.__thumbnail,
      node.__mediaType,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key
    );
  }

  static importJSON({
    type,
    _type,
    ...serializedNode
  }: SerializedImageNode): MediaNode {
    const node = $createMediaNode({
      ...serializedNode,
      type: _type,
    });
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__thumbnail ?? this.__location);
    element.setAttribute("alt", this.__altText);
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
    location: string,
    thumbnail: string | undefined,
    type: Media.MediaType,
    altText: string,
    maxWidth: number,
    width?: "inherit" | number,
    height?: "inherit" | number,
    showCaption?: boolean,
    caption?: string,
    captionsEnabled?: boolean,
    key?: NodeKey
  ) {
    super(key);
    this.__id = id;
    this.__location = location;
    this.__thumbnail = thumbnail;
    this.__mediaType = type;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width ?? "inherit";
    this.__height = height ?? "inherit";
    this.__showCaption = showCaption ?? false;
    this.__caption = caption;
    this.__captionsEnabled = captionsEnabled ?? captionsEnabled === undefined;
  }

  exportJSON(): SerializedImageNode {
    return {
      id: this.__id,
      description: this.__caption ?? this.getAltText(),
      location: this.__location,
      thumbnail: this.__thumbnail,
      _type: this.__mediaType,
      type: "media",
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

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
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
    return this.__thumbnail ?? this.__location;
  }

  getAltText(): string {
    return this.__altText;
  }

  decorate(): JSX.Element {
    return (
      <Suspense fallback={null}>
        <MediaElementComponent
          media={{
            id: this.__id,
            description: this.__caption ?? this.__altText,
            location: this.__location,
            thumbnail: this.__thumbnail,
            type: this.__mediaType,
            events: [],
            links: [],
            keywords: [],
            creator: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: undefined,
          }}
        />
      </Suspense>
    );
  }
}

export function $createMediaNode({
  id,
  location,
  type,
  description,
  height,
  maxWidth = 500,
  captionsEnabled,
  thumbnail,
  width,
  showCaption,
  key,
}: MediaPayload): MediaNode {
  return $applyNodeReplacement(
    new MediaNode(
      id,
      location,
      thumbnail,
      type,
      description,
      maxWidth,
      width,
      height,
      showCaption,
      description,
      captionsEnabled,
      key
    )
  );
}

export function $isMediaNode(
  node: LexicalNode | null | undefined
): node is MediaNode {
  return node instanceof MediaNode;
}
