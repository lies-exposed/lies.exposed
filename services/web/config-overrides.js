/* config-overrides.js */

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = function override(config) {

	config.resolve = {
		...config.resolve,
		plugins: config.resolve.plugins.concat(new TsconfigPathsPlugin())
	}

	return config
}
