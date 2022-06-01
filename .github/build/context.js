const fs = require("fs");

const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_REF, GITHUB_HEAD_REF } = process.env;

const [GITHUB_REPOSITORY_OWNER, GITHUB_REPOSITORY_NAME] = GITHUB_REPOSITORY.split("/");
const REF_SHORT_NAME = GITHUB_REF.split("/")[2];
const IS_PULL_REQUEST = GITHUB_REF.startsWith("refs/pull");
const REF = IS_PULL_REQUEST ? GITHUB_HEAD_REF : GITHUB_REF;

let environment, buildId;
if (IS_PULL_REQUEST) {
  environment = "#" + REF_SHORT_NAME;
  buildId = "PR" + REF_SHORT_NAME;
} else {
  environment = REF_SHORT_NAME == "main" ? "production" : REF_SHORT_NAME;
  buildId = REF_SHORT_NAME;
}

let deployUrl = "https://";
if (fs.existsSync("CNAME")) {
  deployUrl += fs.readFileSync("CNAME");
} else if (GITHUB_REPOSITORY_NAME == GITHUB_REPOSITORY_OWNER + ".github.io") {
  deployUrl += GITHUB_REPOSITORY_NAME;
} else {
  deployUrl += GITHUB_REPOSITORY_OWNER + ".github.io/" + GITHUB_REPOSITORY_NAME;
}
if (buildId != "main") {
  deployUrl += "/" + buildId;
}

const context = {
  GITHUB_TOKEN,
  GITHUB_REPOSITORY,
  GITHUB_REPOSITORY_OWNER,
  GITHUB_REPOSITORY_NAME,
  GITHUB_REF,
  GITHUB_HEAD_REF,
  REF,
  REF_SHORT_NAME,
  environment,
  buildId,
  deployUrl,
};

console.log("Running with context:", context);

module.exports = context;
