module.exports = {
  siteMetadata: {
    title: `ECOnnessione`,
    description: `Emergenza planetaria a 360º.`,
    author: `@ascariandrea`,
  },
  plugins: [
    `gatsby-plugin-tsconfig-paths`,
    `gatsby-plugin-typescript`,
    `gatsby-plugin-styletron`,
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        includePaths: ["./src/scss"],
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
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-numbered-footnotes`,
          {
            resolve: "gatsby-remark-component",
            options: {
              components: ["full-size-section", "graph-selector"],
            },
          },
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
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "content",
        path: `${__dirname}/content`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "media",
        path: `${__dirname}/static/media/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "data",
        path: `${__dirname}/static/data/`,
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
        modulePath: `${__dirname}/src/cms/cms.ts`,
        manualInit: true,
      },
    },
    `gatsby-plugin-offline`,
  ],
}
