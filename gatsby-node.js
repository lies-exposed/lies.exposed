const GN = require("./gatsby/gatsby-node")

exports.createPages = GN.createPages
exports.createSchemaCustomization = GN.createSchemaCustomization
exports.createResolvers = GN.createResolvers;
exports.onCreateNode = GN.onCreateNode
