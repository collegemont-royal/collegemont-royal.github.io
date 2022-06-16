const fs = require("fs");
const { promisify } = require("util");
const browserify = require("browserify");
const babelify = require("babelify");
const tinyify = require("tinyify");
const htmlMinifier = require("html-minifier");
const postcss = require("postcss");
const cssnano = require("cssnano");

const config = require("./config");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const copyFile = promisify(fs.copyFile);

const ref = process.env.GITHUB_REF;
let base = (ref.startsWith("refs/pull") ? "/PR" : "/") + ref.split("/")[2];
if (base === "/main") base = "/";

const fileProcessingFunctions = {
  '.js': (sourcePath, destPath) =>
    new Promise((resolve, reject) => {
      browserify(config.modules.browserify)
        .transform(babelify.configure(config.modules.babel))
        .plugin(tinyify)
        .require(sourcePath, { entry: true })
        .bundle()
        .on("error", (err) => reject(err))
        .pipe(fs.createWriteStream(destPath))
        .on("error", (err) => reject(err))
        .on("finish", () => resolve());
    }),

  '.html': (sourcePath, destPath) => {
    if (sourcePath === 'index.html')
      destPath = destPath.replace(/index\.html$/, '404.html');
    return readFile(sourcePath, "utf8")
      .then((data) => {
        if (sourcePath === 'index.html')
          data = data.replace('<base href="/">', `<base href="${base}">`);
        return htmlMinifier.minify(data, config.modules.htmlMinifier);
      })
      .then((data) => writeFile(destPath, data, "utf8"));
  },

  '.css': (sourcePath, destPath) =>
    readFile(sourcePath, "utf8")
      .then((data) => postcss([cssnano(config.modules.cssNano)]).process(data, { from: sourcePath, to: destPath }))
      .then(({ css }) => writeFile(destPath, css, "utf8")),

  '.json': (sourcePath, destPath) =>
    readFile(sourcePath, "utf8")
      .then((data) => JSON.stringify(JSON.parse(data)))
      .then((data) => writeFile(destPath, data, "utf8")),

  default: (sourcePath, destPath) => copyFile(sourcePath, destPath),
};

module.exports = fileProcessingFunctions;
