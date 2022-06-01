const fs = require("fs");
const child_process = require("child_process");
const { promisify } = require("util");
const { Octokit } = require("octokit");

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const exec = promisify(child_process.exec);

const { GITHUB_TOKEN, GITHUB_REPOSITORY, WORKFLOW_RUN_CONCLUSION } = process.env;

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const [owner, repo] = GITHUB_REPOSITORY.split("/");
const success = WORKFLOW_RUN_CONCLUSION == "success";
const state = success ? "success" : "error";

const setDeploymentState = async (deploymentId) => {
  const environment_url = await readFile("deployments/" + deploymentId, "utf8");
  await octokit.rest.repos.createDeploymentStatus({
    owner,
    repo,
    deployment_id: +deploymentId,
    environment_url,
    state,
  });
};

const removeDeployment = (deploymentId) => exec(`git rm -f deployments/${deploymentId}`);

readdir("deployments")
  .then(async (deploymentIds) => {
    for (let deploymentId of deploymentIds) {
      await setDeploymentState(deploymentId);
      if (success) {
        await removeDeployment(deploymentId);
      }
    }
  })
  .then(() => exec("git config user.name github-actions"))
  .then(() => exec("git config user.email support+actions@github.com"))
  .then(() => exec("git commit -m Updates"))
  .then(() => exec(`git remote set-url origin https://git:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`))
  .then(() => exec("git push"))
  .catch((err) => {
    if (err.code == 'ENOENT') {
      console.log("No deployments");
    } else {
      console.error(err);
      process.exit(1);
    }
  });
