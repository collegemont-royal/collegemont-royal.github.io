const config = {
  files: {
    exclude: [
      ".git/",
      ".github/",
      ".gitignore",
      "package.json",
      "package-lock.json",
      "node_modules/",
      "dist/",
    ],
    noTransform: ["site/GeoGendron/"],
  },

  website: {
    entryPoint: "files/cells.json",
  },

  modules: {
    browserify: {},
    babel: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              ie: "9",
            },
            corejs: "3",
            useBuiltIns: "usage",
          },
        ],
      ],
    },
    htmlMinifier: {
      caseSensitive: true,
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
    },
    cssNano: {
      preset: "default",
    },
  },
};

module.exports = config;
