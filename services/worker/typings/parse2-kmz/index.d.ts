declare module "parse2-kmz" {
  var parse2KMZ: {
    parse2KMZ: (data: ArrayBuffer) => Promise<any>;
    toJson: (filePath: string) => Promise<any>;
  }
  export = parse2KMZ;
}
