const fs = require("fs");
const child_process = require("child_process");
const path = require("path");
const { promisify } = require("util");

const config = require("./config");
const context = require("./context");

const readFile = promisify(fs.readFile);
const exec = promisify(child_process.exec);

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

const urlToXml =
  (baseUrl) =>
  ({ location, lastMod }) => {
    return `<url><loc>${baseUrl}${location}</loc><lastmod>${lastMod}</lastmod></url>`;
  };

const urlsToXml = (baseUrl, urls) => {
  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(urlToXml(baseUrl)).join("")}</urlset>`;
};

const getLastMod = (filePath) =>
  exec(`git log -n 1 --format=%at "${filePath}"`, { encoding: "utf8" }).then(({ stdout: gitLog }) => {
    const lastMod = new Date(Number.parseInt(gitLog, 10) * 1000);
    return lastMod.toISOString().substring(0, 10);
  });

const navigatePage = async (pageAbsolutePath, root) => {
  const urls = [];

  const pagePath = path.join(".", pageAbsolutePath);
  const { cells } = await readFile(pagePath, "utf8").then((data) => JSON.parse(data));
  if (cells) {
    urls.push(
      getLastMod(pagePath).then((lastMod) => ({
        location: root ? "/" : "/?src=" + pageAbsolutePath,
        lastMod,
      }))
    );

    for (let cell of cells) {
      if (cell.link && cell.link.endsWith(".json")) {
        urls.push(...(await navigatePage(cell.link, false)));
      }
    }
  }

  return urls.flat();
};

exports.createSitemap = async () => {
  console.log("Creating sitemap...");
  const urls = await navigatePage(config.website.entryPoint, true).then((urls) => Promise.all(urls));
  return XML_HEADER + urlsToXml(context.deployUrl, urls);
};
