/// <reference types="quill" />

declare module "ra-input-rich-text" {
  import Quill from "quill";

  export interface RaInputRichTextProps {
    configureQuill?: (quill: Quill) => void;
    format?: (v: string) => string;
    parse?: (v: string) => string;
    source: string;
    toolbar: any;
  }

  export class RaInputRichText extends React.Component<RaInputRichTextProps> {}
  export = RaInputRichText;
}
