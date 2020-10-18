import { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `ECOnnessione`,
    description: `Emergenza planetaria a 360º.`,
    author: `@ascariandrea`,
    github: {
      user: "ascariandrea",
      repo: "econnessione",
      link: `https://github.com/ascariandrea/econnessione`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-plugin-tsconfig-paths`,
      options: { configFile: `${process.cwd()}/tsconfig.json` },
    },
    `gatsby-plugin-typescript`,
    `gatsby-plugin-styletron`,
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        includePaths: [`${process.cwd()}/src/scss`],
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-transformer-csv`,
      options: { typeName: () => `csvData`, nodePerFile: `csvData` },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [
          `gatsby-remark-autolink-headers`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-numbered-footnotes`,
          `gatsby-remark-embedder`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 600,
              showCaptions: ["title", "alt"],
            },
          },
          {
            resolve: `gatsby-remark-mermaid`,
            options: {
              theme: "forest",
              viewport: {
                width: 600,
                height: 300,
              },
            },
          },
        ],
      },
    },
    `gatsby-plugin-instagram-embed`,
    `gatsby-plugin-twitter`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "actors",
        path: `${process.cwd()}/content/actors`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "projects",
        path: `${process.cwd()}/content/projects`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "articles",
        path: `${process.cwd()}/content/articles`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "events",
        path: `${process.cwd()}/content/events`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "groups",
        path: `${process.cwd()}/content/groups`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "pages",
        path: `${process.cwd()}/content/pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "topics",
        path: `${process.cwd()}/content/topics`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "areas",
        path: `${process.cwd()}/content/areas`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "media",
        path: `${process.cwd()}/static/media/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "data",
        path: `${process.cwd()}/static/data/`,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `ECOnessione`,
        short_name: `econessione`,
        start_url: `/`,
        lang: "it",
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `static/media/img/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: `gatsby-plugin-netlify-cms`,
      options: {
        modulePath: `${process.cwd()}/src/cms/cms.ts`,
        manualInit: true,
      },
    },
    `gatsby-plugin-offline`,
  ],
}

module.exports = config
