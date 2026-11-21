declare module "world-atlas/countries-10m.json" {

  interface Position {
    [index: number]: number;
  }

  interface Geometry {
    type: string;
    arcs?: number[][];
    geometries?: Geometry[];
  }

  interface GeometryCollection {
    type: "GeometryCollection";
    geometries: Geometry[];
  }

  interface TopoJSON {
    type: "Topology";
    arcs: Position[][][];
    objects: {
      countries: GeometryCollection;
      land: GeometryCollection;
    };
  }
  var topo: TopoJSON
  export = topo
}
