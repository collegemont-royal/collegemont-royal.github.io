const { promisify } = require("util");
const ghPages = require("gh-pages");

const build = require("./build");
const Deployment = require("./Deployment");
const {
  buildId,
  GITHUB_REPOSITORY_NAME,
  GITHUB_TOKEN,
  GITHUB_REPOSITORY_OWNER,
  environment,
  REF,
  deployUrl,
  GITHUB_REPOSITORY,
} = require("./context");

const publish = promisify(ghPages.publish);

const publishOptions = {
  user: {
    name: "github-actions",
    email: "support+actions@github.com",
  },
  branch: "dist",
  repo: "https://git:" + GITHUB_TOKEN + "@github.com/" + GITHUB_REPOSITORY + ".git",
};

const deploy = async () => {
  console.log("Deploying to dist/builds/" + buildId);
  await publish("dist", { ...publishOptions, dest: "builds/" + buildId });
  console.log("Deployed");
};

const publishDeployments = async () => {
  console.log("Publishing deployments to dist/deployments");
  await publish("deployments", { ...publishOptions, dest: "deployments", add: true });
  console.log("Published deployments");
};

const copyWorkflows = async () => {
  console.log("Copying workflows to dist");
  await publish(".github", { ...publishOptions, dest: ".github" });
  console.log("Copied workflows");
};

const main = () => {
  console.log("Starting build");
  const deployment = new Deployment(GITHUB_REPOSITORY_OWNER, GITHUB_REPOSITORY_NAME, environment, REF, deployUrl);
  return (
    deployment
      .create(GITHUB_TOKEN)
      .then(build)
      .then(() => deployment.setState("in_progress"))
      .then(deploy)
      .then(publishDeployments)
      .then(() => {
        if (buildId == "main") return copyWorkflows();
      })
      // .then(() => deployment.setState("success"))
      .catch((err) => {
        console.log("Build failed");
        console.error(err);
        return deployment
          .setState(err.name == "FileProcessingError" ? "failure" : "error")
          .catch(() => {})
          .then(() => Promise.reject(err));
      })
      .then(() => {
        console.log("Build succeeded");
      })
  );
};

module.exports = main;
