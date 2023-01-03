const path = require("path");
const moduleAlias = require("module-alias");
moduleAlias(path.resolve(__dirname, "../"));

require("../build/run");
