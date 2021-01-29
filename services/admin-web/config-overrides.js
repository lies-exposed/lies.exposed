const { alias } = require("react-app-rewire-alias");

module.exports = function override(config) {
  alias({
    "@components": "./src/components",
  })(config);
  return config;
};
