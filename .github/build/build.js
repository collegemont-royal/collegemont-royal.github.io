const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const config = require("./config");
const fileProcessingFunctions = require("./fileProcessingFunctions");
const { createSitemap } = require("./sitemap");

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const isDirectory = (path) => stat(path).then((stats) => stats.isDirectory());
const pathNormalize = (path) => path.replace(/\/$/, "");

const copyExcluded = config.files.exclude.map(pathNormalize);
const transformExcluded = config.files.noTransform.map(pathNormalize);
const isCopyExcluded = (path) => copyExcluded.includes(path);
const isTransformExcluded = (path) => transformExcluded.includes(path);

const processFile = (srcPath, dstPath, noTransform = false) => {
  console.log("Processing file " + srcPath);
  const extension = path.extname(srcPath);
  const fileProcessor = (!noTransform && fileProcessingFunctions[extension]) || fileProcessingFunctions.default;
  return fileProcessor(srcPath, dstPath).then(() => console.log("Processed file " + srcPath));
};

const build = () => {
  const fileProcessorErrors = [];
  const fileProcessors = [];

  const processDir = async (dirPath = ".", noTransform = false) => {
    console.log("Processing directory " + dirPath);
    await mkdir(path.join("dist", dirPath), { recursive: true });

    const contents = await readdir(dirPath);
    for (let item of contents) {
      const itemPath = path.join(dirPath, item);

      if (isCopyExcluded(itemPath)) continue;

      const itemIsTransformExcluded = noTransform || isTransformExcluded(itemPath);
      if (await isDirectory(itemPath)) {
        await processDir(itemPath, itemIsTransformExcluded);
      } else {
        fileProcessors.push(
          processFile(itemPath, path.join("dist", itemPath), itemIsTransformExcluded).catch((err) => {
            fileProcessorErrors.push(err);
          })
        );
      }
    }
    console.log("Processed directory " + dirPath);
  };

  console.log("Starting build process...");
  return processDir()
    .then(() => createSitemap())
    .then((sitemap) => writeFile(path.join("dist", "sitemap.xml"), sitemap, "utf8"))
    .then(() => console.log("Saved sitemap"))
    .then(() => Promise.all(fileProcessors))
    .then(() => {
      console.log("Build completed with " + fileProcessorErrors.length + " error(s)");
      if (fileProcessorErrors.length) {
        const err = new Error(fileProcessorErrors.length + " error(s) occured when processing files");
        err.name = "FileProcessingError";
        err.errors = fileProcessorErrors;
        err.stack = "";
        throw err;
      }
    });
};

module.exports = build;
