declare module "page-metadata-parser" {
  export interface Metadata {
    title: string;
    description: string;
    icon: string;
    image: string;
    keywords: string[] | undefined;
    provider: string;
    type: string;
    url: string;
  }

  export function getMetadata(doc: Document, url: string): Metadata;
}
