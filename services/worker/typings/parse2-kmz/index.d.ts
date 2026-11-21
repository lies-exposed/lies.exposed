declare module "parse2-kmz" {
  interface KMZGeometryLike {
    type: string;
  }

  interface KMZFeature {
    geometry?: KMZGeometryLike;
    properties?: {
      name?: string;
    };
  }

  interface KMZResult {
    features?: KMZFeature[];
  }

  var parse2KMZ: {
    parse2KMZ: (data: ArrayBuffer) => Promise<KMZResult>;
    toJson: (filePath: string) => Promise<KMZResult>;
  }
  export = parse2KMZ;
}
