import * as path from 'path'
import { CreateWebpackConfigArgs } from "gatsby";


export const onCreateWebpackConfig = ({ actions, getConfig, }: CreateWebpackConfigArgs): void => {
  const config = getConfig();
  config.devServer = {
    watchOptions: {
      ignored: [
        path.resolve(process.cwd(), 'gatsby-config.js'),
      ]
    }
  };
  actions.replaceWebpackConfig(config);
}