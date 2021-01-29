declare module "world-atlas/countries-10m.json" {

  interface GeometryCollection {
    type: 'GeometryCollection'
    geometries: any
  }

  interface TopoJSON {
    type: 'Topology'
    arcs: Array<Array<any>>
    objects: {
      countries: GeometryCollection
      land: GeometryCollection
    }
  }
  var topo: TopoJSON
  export = topo
}
