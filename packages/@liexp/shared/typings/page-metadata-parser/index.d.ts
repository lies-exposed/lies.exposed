declare module "page-metadata-parser" {
  export interface Metadata {
    title: string;
    description: string;
    icon: string;
    image: string | null;
    keywords: string[] | undefined;
    provider: string | undefined;
    type: string;
    url: string;
    date?: string;
  }

  export function getMetadata(doc: Document, url: string): Metadata;

  export const metadataRuleSets: any;
}
