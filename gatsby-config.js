require('ts-node').register();

// const TsPathsTransformer = require("@zerollup/ts-transform-paths")
// const { generateConfig } = require("gatsby-plugin-ts-config")
// const config = generateConfig({
//   configDir: "gatsby",
//   tsNode: {
//     transformers: function(program) {
//       const tsTransformPaths = TsPathsTransformer(program)
//       return {
//         before: [tsTransformPaths.before],
//         afterDeclarations: [tsTransformPaths.afterDeclarations],
//       }
//     },
//   },
// })

module.exports = require('./gatsby/gatsby-config')