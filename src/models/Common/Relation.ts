// import * as t from "io-ts"

// interface CollectionOpts {
//   collection: string
//   display_fields: string[]
//   search_fields: string[]
// }

// class CMSRelationType<
//   Opts extends CollectionOpts,
//   C extends t.Any,
//   A,
//   O = A,
//   I = unknown
// > extends t.Type<A, O, I> {
//   readonly _tag: "RelationType" = "RelationType"

//   constructor(
//     name: string,
//     is: CMSRelationType<Opts, C, A, O, I>["is"],
//     validate: CMSRelationType<Opts, C, A, O, I>["validate"],
//     encode: CMSRelationType<Opts, C, A, O, I>["encode"],
//     readonly type: C,
//     readonly opts: Opts
//   ) {
//     super(name, is, validate, encode)
//   }
// }

// export interface CMSRelationTypeC<Opts extends CollectionOpts, C extends t.Mixed>
//   extends CMSRelationType<
//     Opts,
//     C,
//     Array<t.TypeOf<C>>,
//     Array<t.OutputOf<C>>,
//     unknown
//   > {}

// export const CMSRelation = <C extends t.Mixed, Opts extends CollectionOpts>(
//   item: C,
//   opts: Opts,
//   name: string = `CMSRelation<${opts.collection}>`,
// ): CMSRelationTypeC<Opts, C> => 
//   new CMSRelationType(
//     name,
//     t.array(item).is,
//     t.array(item).validate,
//     t.array(item).encode,
//     item,
//     opts
//   )
