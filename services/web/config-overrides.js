const { alias } = require("react-app-rewire-alias");

module.exports = function override(config) {
  alias({
    "@components": "./src/components",
    "@helpers": "./src/helpers",
    "@templates": "./src/templates",
    "@theme": "./src/theme",
    "@mock-data": "./src/mock-data",
    "@utils": "./src/utils",
    "@providers": "./src/providers",
  })(config);
  return config;
};
