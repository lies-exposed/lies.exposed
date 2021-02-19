const { alias } = require("react-app-rewire-alias");

module.exports = function override(config) {
  alias({
    "@templates": "./src/templates",
    "@theme": "./src/theme",
    "@utils": "./src/utils",
    "@providers": "./src/providers",
    "@io": "../../packages/@econnessione/shared/src/io",
    "@components": "../../packages/@econnessione/shared/src/components",
    "@helpers": "../../packages/@econnessione/shared/src/helpers",
    "@mock-data": "../../packages/@econnessione/shared/src/mock-data",
    "@theme": "../../packages/@econnessione/shared/src/theme",
    "@utils": "../../packages/@econnessione/shared/src/utils",
    "@econnessione/shared": "../../packages/@econnessione/shared/src",
  })(config);
  return config;
};
