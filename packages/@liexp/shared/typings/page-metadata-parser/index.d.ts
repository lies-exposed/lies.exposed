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
    date?: Date;
  }

  export function getMetadata(doc: Document, url: string): Metadata;

  export const metadataRuleSets: any;
}
