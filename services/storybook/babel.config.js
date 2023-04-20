module.exports = {
  sourceType: "unambiguous",
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          chrome: 100,
          node: "current"
        },
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react"
  ],
  plugins: [],
};
